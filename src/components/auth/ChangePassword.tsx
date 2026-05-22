import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Circle,
} from "lucide-react";
import { useAuth } from "../../store/hooks/useAuth";
import { Button } from "../common";
import { getErrorMessage } from "../../store/utils/apiError";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user, changePassword, markFirstLoginComplete, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState("");
  const [warnBeforeUnload, setWarnBeforeUnload] = useState(
    Boolean(user?.isFirstLogin)
  );

  const isFirstLogin = user?.isFirstLogin;

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
  }, []);

  useEffect(() => {
    if (isFirstLogin && warnBeforeUnload) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFirstLogin, warnBeforeUnload, handleBeforeUnload]);

  const handleLogout = useCallback(async () => {
    setWarnBeforeUnload(false);
    await logout.mutate();
  }, [logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");

    // Disable beforeunload warning during submission
    if (isFirstLogin) {
      setWarnBeforeUnload(false);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    // Client-side validation
    const passwordPolicyRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordPolicyRegex.test(newPassword)) {
      setClientError(
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 special character"
      );
      if (isFirstLogin) setWarnBeforeUnload(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setClientError("New passwords do not match");
      if (isFirstLogin) setWarnBeforeUnload(true);
      return;
    }

    if(newPassword === currentPassword){
      setClientError("New password cannot be same as current password");
      if (isFirstLogin) setWarnBeforeUnload(true);
      return;
    }

    try {
      // 1️⃣ Change password
      await changePassword.mutate({
        currentPassword,
        newPassword,
      }).unwrap();

      // 2️⃣ Mark first login complete (ONLY for first login)
      if (isFirstLogin) {
        await markFirstLoginComplete.mutate().unwrap();
      }

      // 3️⃣ Force logout (security best practice)
      await logout.mutate();
      
      // Navigate to login (logout might already do this)
      navigate("/login");
    } catch (err) {
      console.error("Password change failed:", err);
      // Re-enable warning if operation fails
      if (isFirstLogin) {
        setWarnBeforeUnload(true);
      }
    }
  };

  // ✅ Combine client and server errors
  const displayError = clientError || getErrorMessage(changePassword.error);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {isFirstLogin && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleLogout}
              disabled={logout.isLoading}
              className="text-sm text-slate-600 hover:text-slate-900 underline disabled:opacity-50"
            >
              {logout.isLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            {isFirstLogin ? "Set Your Password" : "Change Password"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isFirstLogin
              ? "Welcome! Please set your password to continue."
              : "Update your password to keep your account secure"}
          </p>
          {isFirstLogin && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> You must change your password before
                accessing the system. This is a security requirement for all new
                accounts.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-soft border border-slate-200">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {displayError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    {isFirstLogin ? "Default Password" : "Current Password"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder={
                        isFirstLogin
                          ? "Enter your default password"
                          : "Enter current password"
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <Button
                  onClick={handleSubmit}
                  appearance="primary"
                  size="large"
                  disabled={changePassword.isLoading || markFirstLoginComplete.isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePassword.isLoading || markFirstLoginComplete.isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isFirstLogin ? (
                    "Set Password"
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Password Requirements - Same as before */}
          <div className="bg-white p-6 rounded-lg shadow-soft border border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary-600" />
              Password Requirements
            </h3>
            <ul className="space-y-3">
              <li
                className={`flex items-center ${
                  newPassword.length >= 8 ? "text-green-700" : "text-slate-600"
                }`}
              >
                {newPassword.length >= 8 ? (
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-sm">At least 8 characters long</span>
              </li>
              <li
                className={`flex items-center ${
                  /[A-Z]/.test(newPassword) ? "text-green-700" : "text-slate-600"
                }`}
              >
                {/[A-Z]/.test(newPassword) ? (
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-sm">
                  Contains at least 1 uppercase letter
                </span>
              </li>
              <li
                className={`flex items-center ${
                  /[a-z]/.test(newPassword) ? "text-green-700" : "text-slate-600"
                }`}
              >
                {/[a-z]/.test(newPassword) ? (
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-sm">
                  Contains at least 1 lowercase letter
                </span>
              </li>
              <li
                className={`flex items-center ${
                  /[^A-Za-z0-9]/.test(newPassword)
                    ? "text-green-700"
                    : "text-slate-600"
                }`}
              >
                {/[^A-Za-z0-9]/.test(newPassword) ? (
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-sm">
                  Contains at least 1 special character
                </span>
              </li>
              <li
                className={`flex items-center ${
                  currentPassword &&
                  newPassword &&
                  newPassword !== currentPassword
                    ? "text-green-700"
                    : "text-slate-600"
                }`}
              >
                {currentPassword &&
                newPassword &&
                newPassword !== currentPassword ? (
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-sm">Different from current password</span>
              </li>
              <li
                className={`flex items-center ${
                  confirmPassword && newPassword === confirmPassword
                    ? "text-green-700"
                    : "text-slate-600"
                }`}
              >
                {confirmPassword && newPassword === confirmPassword ? (
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-sm">
                  Both new password fields must match
                </span>
              </li>
              {isFirstLogin && (
                <li className="flex items-center text-slate-600">
                  <Circle className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                  <span className="text-sm">
                    You'll be redirected to login after setting password
                  </span>
                </li>
              )}
            </ul>

            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <h4 className="text-sm font-medium text-primary-900 mb-2">
                💡 Tips for a strong password:
              </h4>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• Use a mix of letters, numbers, and symbols</li>
                <li>• Avoid common words or personal information</li>
                <li>• Consider using a passphrase instead of a single word</li>
                <li>• Don't reuse passwords from other accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;