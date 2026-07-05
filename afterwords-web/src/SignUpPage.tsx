import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { AuthDivider, AuthField, AuthLegalLinks, GoogleSignInButton } from "./authShared";
import { ROUTES } from "./routes";

const SignUpPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
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
          Begin your journey
        </h2>
        <p className="text-base text-on-surface-variant font-sans">
          Your private sanctuary for thoughts and literature awaits.
        </p>
      </div>

      <GoogleSignInButton />
      <AuthDivider />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <AuthField
          id="fullName"
          label="Full Name"
          type="text"
          placeholder="The Librarian"
          value={fullName}
          onChange={setFullName}
        />
        <AuthField
          id="email"
          label="Email Address"
          type="email"
          placeholder="thoughtful@afterwords.com"
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
        />

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-sans text-base py-4 rounded-lg font-bold hover:bg-primary-fixed-dim active:scale-[0.98] transition-all shadow-xl shadow-primary/10"
          >
            Create Account
          </button>
        </div>
      </form>

      <div className="mt-10 text-center md:text-left">
        <p className="text-base text-on-surface-variant font-sans">
          Already part of the study?{" "}
          <Link
            to={ROUTES.signIn}
            className="text-primary hover:underline underline-offset-4 decoration-primary/40 transition-all"
          >
            Sign in
          </Link>
        </p>
      </div>

      <AuthLegalLinks />
    </AuthLayout>
  );
};

export default SignUpPage;
