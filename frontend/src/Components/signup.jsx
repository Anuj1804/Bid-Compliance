import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Building2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPasswordStrength = (value) => {
    if (!value) return { label: "", score: 0 };

    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) return { label: "Weak", score: 1 };
    if (score <= 3) return { label: "Medium", score: 2 };
    return { label: "Strong", score: 3 };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = (e) => {
  e.preventDefault();

  const nextErrors = {};

  if (!fullName.trim()) {
    nextErrors.fullName = "Full name is required.";
  }

  if (!email.trim()) {
    nextErrors.email = "Official email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!organization.trim()) {
    nextErrors.organization = "Organization is required.";
  }

  if (!password.trim()) {
    nextErrors.password = "Password is required.";
  } else if (password.length < 8) {
    nextErrors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword.trim()) {
    nextErrors.confirmPassword = "Please confirm your password.";
  } else if (confirmPassword !== password) {
    nextErrors.confirmPassword = "Passwords do not match.";
  }

  if (!agreedToTerms) {
    nextErrors.terms = "You must agree to the Terms of Service.";
  }

  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    return;
  }

  try {
    const existingUser = localStorage.getItem("bidComplianceUser");

    if (existingUser) {
      const parsedUser = JSON.parse(existingUser);

      if (parsedUser.email === email.trim().toLowerCase()) {
        setErrors({
          email: "An account with this email already exists.",
        });
        return;
      }
    }

    const user = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      organization: organization.trim(),
      password: password,
    };

    localStorage.setItem("bidComplianceUser", JSON.stringify(user));

    setIsSubmitting(true);

    navigate("/login");
  } catch (error) {
    console.error("Signup error:", error);

    setErrors({
      email: "Something went wrong. Please try again.",
    });

    setIsSubmitting(false);
  }
};

  const benefits = [
    "Unified verification",
    "AI-assisted compliance analysis",
    "Audit-ready verification history",
  ];

  const strengthLabelColor = {
    Weak: "text-red-500",
    Medium: "text-amber-500",
    Strong: "text-blue-600",
  };

  const strengthBarColor = {
    1: "bg-red-400",
    2: "bg-amber-400",
    3: "bg-blue-500",
  };

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
            Build trust before you bid.
          </h1>

          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Create your account and get started with AI-powered bid
            compliance verification.
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

      {/* RIGHT PANEL — Signup Form */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 sm:px-10 py-14 lg:py-0 bg-white">
        <div className="w-full max-w-sm animate-[fadeInUp_0.6s_ease-out_0.15s_both]">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 mb-3">
            GET STARTED
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Create your Bid Compliance account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Set up your account to access your compliance verification
            workspace.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? "fullName-error" : undefined
                  }
                  className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                    errors.fullName ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="mt-1.5 text-xs text-red-500">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Official Email */}
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

            {/* Organization */}
            <div>
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Organization
              </label>
              <div className="relative">
                <Building2
                  className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  autoComplete="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Enter organization name"
                  aria-invalid={Boolean(errors.organization)}
                  aria-describedby={
                    errors.organization ? "organization-error" : undefined
                  }
                  className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                    errors.organization ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.organization && (
                <p
                  id="organization-error"
                  className="mt-1.5 text-xs text-red-500"
                >
                  {errors.organization}
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create your password"
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

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          step <= passwordStrength.score
                            ? strengthBarColor[passwordStrength.score]
                            : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Password strength:{" "}
                    <span
                      className={`font-medium ${
                        strengthLabelColor[passwordStrength.label] || ""
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}

              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                  className={`w-full rounded-xl border bg-white pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-md p-0.5 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4.5 h-4.5" size={18} />
                  ) : (
                    <Eye className="w-4.5 h-4.5" size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="mt-1.5 text-xs text-red-500"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label
                htmlFor="terms"
                className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer select-none"
              >
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 cursor-pointer"
                />
                <span>
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 text-xs text-red-500">{errors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" size={16} />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" size={16} />
                </>
              )}
            </button>

            {/* Sign in */}
            <p className="text-center text-sm text-slate-500 pt-1">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:underline"
              >
                Sign in
              </a>
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

export default SignUp;
