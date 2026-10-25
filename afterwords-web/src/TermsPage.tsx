import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "./routes";

const TermsPage: React.FC = () => (
  <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
    <Link to={ROUTES.signIn} className="text-primary hover:underline text-sm mb-8 inline-block">
      Back to sign in
    </Link>
    <h1 className="font-display text-4xl text-on-surface mb-6 font-bold">Terms of Service</h1>
    <p className="text-on-surface-variant font-sans leading-relaxed mb-4">
      By using Afterwords, you agree to use the service respectfully and lawfully. You are
      responsible for the reflections you publish and for keeping your account credentials secure.
    </p>
    <p className="text-on-surface-variant font-sans leading-relaxed mb-4">
      Public reflections may be visible to other users on book pages. Do not post content that is
      unlawful, harassing, or that violates the rights of others. Afterwords may remove content or
      suspend accounts that abuse the service.
    </p>
    <p className="text-on-surface-variant font-sans leading-relaxed mb-4">
      Book metadata and catalog content are provided for discovery and personal journaling. Afterwords
      is provided as-is without warranties of uninterrupted availability.
    </p>
    <p className="text-on-surface-variant font-sans leading-relaxed">
      We may update these terms as the product evolves. Continued use of Afterwords after changes
      are posted constitutes acceptance of the updated terms.
    </p>
    <p className="text-xs text-on-surface-variant/60 mt-10 font-sans">Last updated: August 2026</p>
  </main>
);

export default TermsPage;
