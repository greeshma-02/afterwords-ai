import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "./routes";

const PrivacyPolicyPage: React.FC = () => (
  <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
    <Link to={ROUTES.signIn} className="text-primary hover:underline text-sm mb-8 inline-block">
      Back to sign in
    </Link>
    <h1 className="font-display text-4xl text-on-surface mb-6 font-bold">Privacy Policy</h1>
    <p className="text-on-surface-variant font-sans leading-relaxed mb-4">
      Afterwords collects the information you provide when you create an account, sign in with
      Google, save books to your shelf, and write reflections. This includes your name, email
      address, shelf data, and reflection content.
    </p>
    <p className="text-on-surface-variant font-sans leading-relaxed mb-4">
      We use this information to operate your personal reading journal, authenticate your account,
      and display your saved books and reflections. Reflections marked private are only visible to
      you. Public reflections may be shown to other readers on book pages.
    </p>
    <p className="text-on-surface-variant font-sans leading-relaxed mb-4">
      We do not sell your personal data. Account data is stored securely and used only to provide
      the Afterwords service. You may delete reflections you have written at any time.
    </p>
    <p className="text-on-surface-variant font-sans leading-relaxed">
      If you have questions about this policy, contact us through the Afterwords support channel
      associated with your account.
    </p>
    <p className="text-xs text-on-surface-variant/60 mt-10 font-sans">Last updated: August 2026</p>
  </main>
);

export default PrivacyPolicyPage;
