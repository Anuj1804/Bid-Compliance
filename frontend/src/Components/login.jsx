import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
  e.preventDefault();

  const nextErrors = {};

  if (!email.trim()) {
    nextErrors.email = "Email is required.";
  }

  if (!password.trim()) {
    nextErrors.password = "Password is required.";
  }

  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) return;

  // Frontend demo authentication
  localStorage.setItem("isLoggedIn", "true");

  if (rememberMe) {
    localStorage.setItem("rememberMe", "true");
  } else {
    localStorage.removeItem("rememberMe");
  }

  navigate("/dashboard");
};

  const benefits = [
    "Unified verification",
    "AI-assisted compliance analysis",
    "Audit-ready verification history",
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      {/* LEFT PANEL — Brand / Narrative */}
      <div className="relative lg:w-1/2 bg-slate-900 text-white flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-14 lg:py-0 overflow-hidden animate-[fadeIn_0.6s_ease-out]">
        {/* Subtle decorative elements */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-white" />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full border border-white" />
        </div>
        <div className="pointer-events-none absolute top-10 right-10 hidden sm:block">
          <ShieldCheck className="w-16 h-16 text-blue-400/20" strokeWidth={1.25} />
        </div>

        <div className="relative max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold tracking-[0.2em] text-slate-200">
              BID COMPLIANCE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-white">
            Smarter verification starts here.
          </h1>

          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            AI-powered bid verification for faster, clearer and more
            transparent procurement.
          </p>

          <ul className="mt-10 space-y-4">
            {benefits.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
                </span>
                <span className="text-sm text-slate-300">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-14 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 leading-relaxed">
              Built for structured, accountable procurement workflows —
              designed for GeM bid compliance teams.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 sm:px-10 py-14 lg:py-0 bg-white">
        <div className="w-full max-w-sm animate-[fadeInUp_0.6s_ease-out_0.15s_both]">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 mb-3">
            WELCOME BACK
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Sign in to Bid Compliance
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Access your compliance verification workspace.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Official Email
              </label>
              <div className="relative">
                <Mail
                  className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov.in"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                    errors.email ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={`w-full rounded-xl border bg-white pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                    errors.password ? "border-red-400" : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-md p-0.5 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" size={18} />
                  ) : (
                    <Eye className="w-4.5 h-4.5" size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me / Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <label
                htmlFor="remember-me"
                className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 cursor-pointer"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" size={16} />
            </button>

            {/* Create account */}
            <p className="text-center text-sm text-slate-500 pt-1">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:underline"
              >
                Create account
              </button>
            </p>
          </form>

          {/* Security note */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4" size={16} />
            <span>Secure access for authorized procurement users.</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
