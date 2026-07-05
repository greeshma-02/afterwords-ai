import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { AuthDivider, AuthField, AuthLegalLinks, GoogleSignInButton } from "./authShared";
import { ROUTES } from "./routes";

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

      <GoogleSignInButton />
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
            <a
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
            className="w-full bg-primary text-on-primary font-sans text-base py-4 rounded-lg font-bold hover:bg-primary-fixed-dim active:scale-[0.98] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2"
          >
            <span className="text-sm uppercase tracking-widest font-bold">Enter the Study</span>
            <span className="material-symbols-outlined text-lg">login</span>
          </button>
        </div>
      </form>

      <div className="mt-10 text-center md:text-left">
        <p className="text-base text-on-surface-variant font-sans">
          New to the collection?{" "}
          <Link
            to={ROUTES.signUp}
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
