import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "./routes";

const ReflectionsPage: React.FC = () => {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <section className="text-center mb-10">
        <span className="material-symbols-outlined text-primary/60 text-4xl mb-4">
          edit_note
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-slate-100">
          Your Reflections
        </h2>
        <p className="italic text-sm tracking-widest mt-2 text-primary/60">
          Thoughts you&apos;ve saved along the way.
        </p>
      </section>

      <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-10 text-center">
        <p className="text-slate-300 mb-6 italic">
          Open a book from your shelf and tap the pen to write a reflection.
        </p>
        <Link
          to={ROUTES.home}
          className="text-xs font-bold text-primary border-b border-primary/30 pb-1 uppercase tracking-widest hover:text-primary/80 transition-colors"
        >
          Back to Shelf
        </Link>
      </div>
    </main>
  );
};

export default ReflectionsPage;
