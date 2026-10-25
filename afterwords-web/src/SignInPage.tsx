import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { AuthDivider, AuthField, AuthLegalLinks, GoogleSignInButton } from "./authShared";
import { signIn } from "./authApi";
import { ROUTES } from "./routes";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? ROUTES.home;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShowPassword=false;
  const handleAuthSuccess = () => {
    navigate(returnTo.startsWith("/afterwords") ? returnTo : ROUTES.home, {
      replace: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signIn({ email, password });
      handleAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10 text-center md:text-left">
        <h2 className="font-display text-3xl text-on-surface mb-2 font-bold">
          Welcome back to the sanctuary
        </h2>
        <p className="text-base text-on-surface-variant italic font-sans">
          Find your place among the echoes of thoughts.
        </p>
      </div>

      {error && <p className="text-sm text-red-300 mb-6">{error}</p>}

      <GoogleSignInButton onSuccess={handleAuthSuccess} onError={setError} />
      <AuthDivider label="Or your manuscript keys" />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <AuthField
          id="email"
          label="Email Address"
          type="email"
          placeholder="the.librarian@afterwords.com"
          value={email}
          onChange={setEmail}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          showToggle
          visible={showPassword}
          onToggleVisibility={() => setShowPassword((v) => !v)}
          labelExtra={
            isShowPassword&& <a
              href="#"
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary/60 hover:text-primary transition-colors font-sans"
            >
              Forgotten?
            </a>
          }
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-on-primary font-sans text-base py-4 rounded-lg font-bold hover:bg-primary-fixed-dim active:scale-[0.98] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span className="text-sm uppercase tracking-widest font-bold">
              {submitting ? "Signing in…" : "Enter the Study"}
            </span>
            <span className="material-symbols-outlined text-lg">login</span>
          </button>
        </div>
      </form>

      <div className="mt-10 text-center md:text-left">
        <p className="text-base text-on-surface-variant font-sans">
          New to the collection?{" "}
          <Link
            to={
              searchParams.get("returnTo")
                ? `${ROUTES.signUp}?returnTo=${encodeURIComponent(returnTo)}`
                : ROUTES.signUp
            }
            className="text-primary hover:underline underline-offset-4 decoration-primary/40 transition-all"
          >
            Create an account
          </Link>
        </p>
      </div>

      <AuthLegalLinks />
    </AuthLayout>
  );
};

export default SignInPage;
