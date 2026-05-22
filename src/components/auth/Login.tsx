import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../store/hooks/useAuth";
import { Button } from "../common";
import { getErrorMessage } from "../../store/utils/apiError";
import { useGetOrganizationByCodeQuery } from "../../store/apis/organization.api";
import AuthLayout, { DEFAULT_ORG, getOrgCodeFromSubdomain } from "./AuthLayout";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const queryCode = useMemo(
    () => getOrgCodeFromSubdomain() ?? DEFAULT_ORG.queryCode,
    [],
  );
  useGetOrganizationByCodeQuery(queryCode);
  const orgCodeToSend = queryCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login.mutate({
      workEmail: username,
      password,
      orgCode: orgCodeToSend,
    });
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 text-center tracking-tight">
          <span className="text-gradient">HRMS</span>{" "}
          <span className="text-slate-900">Login</span>
        </h1>
        <p className="text-slate-500 text-center mt-2 text-sm font-medium">
          Enter your credentials to access your account.
        </p>
      </div>

      <form className="space-y-5 mb-1">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Work Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 hover:border-slate-300"
              placeholder="Enter your work email"
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 hover:border-slate-300"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors duration-200"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div
          onClick={() => navigate("/forgot-password")}
          className="text-right text-primary-600 cursor-pointer hover:text-primary-700 transition-colors duration-200 text-sm font-semibold"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/forgot-password")}
        >
          Forgot Your Password?
        </div>

        {login.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in font-medium">
            {getErrorMessage(login.error)}
          </div>
        )}

        <Button
          htmlType="submit"
          appearance="primary"
          size="large"
          onClick={handleSubmit}
          disabled={login.isLoading || !username.trim() || !password.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-blue-600 disabled:!text-white disabled:!border-blue-600"
        >
          {login.isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="font-bold tracking-wide">Sign In</span>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
