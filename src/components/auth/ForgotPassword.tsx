import React, { useEffect, useMemo, useState } from "react";
import {
  Mail,
  ArrowLeft,
  KeyRound,
  Send,
  ShieldCheck,
  RefreshCw,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
} from "../../store/apis/auth.api";
import toast from "react-hot-toast";
import { Button, Input } from "../common";
import { ApiError } from "../../store/utils/apiError";
import AuthLayout, { DEFAULT_ORG, getOrgCodeFromSubdomain } from "./AuthLayout";

const ForgetPassword = () => {
  const navigate = useNavigate();

  const orgCode = useMemo(
    () => getOrgCodeFromSubdomain() ?? DEFAULT_ORG.queryCode,
    [],
  );

  const [forgetPassword, { isLoading: forgetPasswordLoading }] =
    useForgetPasswordMutation();
  const [verifyOtp, { isLoading: verifyOtpLoading }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: resetPasswordLoading }] =
    useResetPasswordMutation();

  const isLoading =
    forgetPasswordLoading || verifyOtpLoading || resetPasswordLoading;

  const [step, setStep] = useState("EMAIL");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifiedOtp, setVerifiedOtp] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isTimer, setIsTimer] = useState(true);
  const [seconds, setSeconds] = useState(60);

  const [error, setError] = useState("");

  const startTimer = () => {
    setIsTimer(true);
    setSeconds(60);
  };

  const handleResendOtp = async () => {
    try {
      await forgetPassword({ workEmail: email, orgCode }).unwrap();
      startTimer();
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage =
        err?.data?.message || err?.message || "Failed to resend OTP";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      setError(errorMessage);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    try {
      await forgetPassword({ workEmail: email, orgCode }).unwrap();
      setStep("OTP");
      startTimer();
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage =
        err?.data?.message || err?.message || "Failed to send OTP";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      setError(errorMessage);
    }
  };

  // 2. Handle OTP input changes and auto-focus
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && element.nextSibling) {
      (element.nextSibling as HTMLElement).focus();
    }
  };

  // 3. Handle backspace auto-focus
  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      (e.target as HTMLInputElement).previousSibling
    ) {
      // Safely cast the generic ChildNode to HTMLElement
      ((e.target as HTMLInputElement).previousSibling as HTMLElement).focus();
    }
  };

  // 4. Handle paste functionality
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (isNaN(Number(pastedData))) return;

    const pastedDigits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];

    pastedDigits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pastedDigits.length, 5);
    const targetInput = document.getElementById(`otp-input-${nextIndex}`);
    if (targetInput) {
      targetInput.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    try {
      const res = await verifyOtp({ workEmail: email, otp: otpCode }).unwrap();
      setVerifiedOtp(res?.data?.data);
      setStep("NEW_PASSWORD");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || err?.message || 'Failed to verify OTP';
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
      setError(errorMessage);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordPolicyRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordPolicyRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 special character",
      );
      return;
    }

    setError("");
    try {
      await resetPassword({
        workEmail: email,
        otp: verifiedOtp as string,
        newPassword: newPassword,
      }).unwrap();
      navigate("/login");
      toast.success(
        "Password reset successfully! You can now login with your new password",
      );
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || err?.message || 'Failed to reset password';
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
      setError(errorMessage);
    }
  };

  const handleBack = () => {
    setOtp(["", "", "", "", "", ""]);
    if (step === "OTP") setStep("EMAIL");
    else if (step === "NEW_PASSWORD") setStep("EMAIL");
    else navigate("/login");
    setError("");
  };

  useEffect(() => {
    if (!isTimer) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimer]);

  return (
    <AuthLayout>
      {/* STEP 1: EMAIL INPUT */}
      {step === "EMAIL" && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-4">
              <KeyRound className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-slate-600 text-sm">
              No worries! Enter your email and we'll send you a verification
              code.
            </p>
          </div>

          <form className="space-y-4 mb-6" onSubmit={handleSendEmail}>
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(val) => setEmail(String(val))}
              placeholder="Enter your work email"
              required
              leftIcon={<Mail className="w-5 h-5" />}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in text-center">
                {error}
              </div>
            )}

            <Button
              htmlType="submit"
              appearance="primary"
              loading={isLoading}
              disabled={isLoading || !email.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-600 flex items-center justify-center space-x-2 disabled:!bg-indigo-600 disabled:!text-white disabled:!border-indigo-600"
              icon={!isLoading && <Send className="w-4 h-4" />}
            >
              Send Code
            </Button>
          </form>
        </div>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === "OTP" && (
        <div className="animate-fade-in">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-4">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Check your email
            </h1>
            <p className="text-slate-600 text-sm">
              The 6-digit OTP is sent to your work email address <br />
              <span className="font-semibold text-slate-900">{email}</span>
            </p>
          </div>

          <form className="space-y-4 mb-2" onSubmit={handleVerifyOtp}>
            <div className="flex justify-center sm:gap-3 gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-2xl font-bold border border-slate-300 rounded-lg focus:border-transparent focus:ring-primary-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in text-center">
                {error}
              </div>
            )}

            <Button
              htmlType="submit"
              appearance="primary"
              loading={verifyOtpLoading}
              disabled={isLoading || otp.some((d) => d === "")}
              className="w-full !mt-5 bg-indigo-600 hover:bg-indigo-700 disabled:!bg-indigo-600 disabled:!text-white disabled:!border-indigo-600"
            >
              Verify Code
            </Button>

            <div className="flex justify-center items-center mt-3">
              <div className="flex items-center gap-2">

                <Button
                  appearance="text"
                  disabled={isTimer}
                  onClick={handleResendOtp}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${isTimer
                      ? "text-slate-400"
                      : "text-slate-600 hover:text-indigo-600"
                    }`}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Resend Code
                </Button>

                {/* animated wrapper */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${isTimer ? "max-w-xs opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
                    }`}
                >
                  <span className="text-sm text-red-500 whitespace-nowrap">
                    Resend Code in {seconds}s
                  </span>
                </div>

              </div>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: CREATE NEW PASSWORD */}
      {step === "NEW_PASSWORD" && (
        <div className="animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-4">
              <CheckCircle2 className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Secure Account
            </h1>
            <p className="text-slate-600 text-sm">
              Your identity has been verified. Please create a new password.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleResetPassword}>
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(val) => setNewPassword(String(val))}
              placeholder="Enter new password"
              required
              leftIcon={<Lock className="w-5 h-5" />}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(val) => setConfirmPassword(String(val))}
              placeholder="Confirm new password"
              required
              leftIcon={<Lock className="w-5 h-5" />}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in text-center">
                {error}
              </div>
            )}

            <Button
              htmlType="submit"
              appearance="primary"
              loading={isLoading}
              disabled={
                isLoading || !newPassword.trim() || !confirmPassword.trim()
              }
              className="w-full disabled:!bg-indigo-600 disabled:!text-white disabled:!border-indigo-600"
            >
              Submit
            </Button>
          </form>
        </div>
      )}

      {/* Shared Back/Cancel Button */}
      <Button
        appearance="text"
        onClick={handleBack}
        className="mt-4 flex items-center justify-center gap-2 text-slate-600 font-medium w-full"
        icon={<ArrowLeft className="w-4 h-4" />}
      >
        {step === "EMAIL"
          ? "Back to Login"
          : step === "OTP"
            ? "Back to Email"
            : "Cancel"}
      </Button>
    </AuthLayout>
  );
};

export default ForgetPassword;