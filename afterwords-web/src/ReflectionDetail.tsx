import React from "react";
import type { ApiReflection } from "./reflectionApi";
import { formatReflectionDate, reflectionQuote } from "./reflectionApi";

interface ReflectionDetailProps {
  reflection: ApiReflection;
  onBack: () => void;
}

const ReflectionDetail: React.FC<ReflectionDetailProps> = ({ reflection, onBack }) => {
  const teaser = reflection.title.trim() || reflectionQuote(reflection.body);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-cream">
      <div className="paper-grain" />

      <div className="border-b border-primary/10 bg-background-dark/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="text-primary/60 hover:text-primary transition-colors"
            >
              Shelf
            </button>
            <span className="text-primary/40">/</span>
            <span className="text-slate-100 font-medium">Reflection</span>
          </nav>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
            {reflection.bookTitle}
          </h1>
          <p className="text-lg text-slate-300 italic">by {reflection.bookAuthor}</p>
        </header>

        <div className="border-t border-primary/20 mb-10" />

        <p className="text-xl italic text-primary/80 leading-relaxed mb-8">
          &ldquo;{teaser}&rdquo;
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-10">
          <span>
            Written by <span className="text-slate-200">{reflection.authorName}</span>
          </span>
          <span className="text-primary/30">·</span>
          <span>{formatReflectionDate(reflection.createdAt)}</span>
          <span className="text-primary/30">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-base text-primary/70">favorite</span>
            {reflection.likesCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-base text-primary/70">
              chat_bubble
            </span>
            {reflection.commentsCount}
          </span>
        </div>

        <section className="mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
            Reflection
          </h2>
          <p className="text-slate-200 leading-relaxed text-justify whitespace-pre-line">
            {reflection.body}
          </p>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
            Comments
          </h2>
          <p className="text-slate-400 italic text-sm">
            No comments yet. Be the first to respond.
          </p>
        </section>
      </main>
    </div>
  );
};

export default ReflectionDetail;
