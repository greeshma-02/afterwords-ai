import React from "react";
import Button from "./Button";
import HowThisBookFeels from "./HowThisBookFeels";
import ReaderReflections from "./ReaderReflections";
import QuoteSection from "./QuoteSection";

const FALLBACK_COVER_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBH7CXaV-pWWPXQLlVSj2pfk8s52zmA_VH9uWJajzB-a_3QfQNmiiWqZriD9vy7s2pT5SZ-3yzMcMqCgXFGd8TS35m34mBrjstQ3ZoheAIxs0s0U17QwpZUtlix0SVBUUV_oqMdDxrSs8m0NAbskPkktLKt7dgkiXpWT5b0tBpMEnSr3vJ_MLEdOJo_2yAInH8v0tLFj4psaZo0VB24r_X53daTqn2WtcqR_KYax8UeRHzhfWDMWZNAV7-SYzkDH9GnkRN5G73T01UI";

const DEFAULT_SYNOPSIS =
  "Reflections and notes about this book will appear here. Write a reflection to capture what this book meant to you.";

interface BookDetailProps {
  book: {
    id: number;
    title: string;
    author: string;
    imageUrl?: string;
    description?: string;
    sadness?: number;
    comfort?: number;
    hope?: number;
    joy?: number;
    humor?: number;
    connection?: number;
    intensity?: number;
  };
  tags: string[];
  onBack: () => void;
  synopsis?: string;
}

const BookDetail: React.FC<BookDetailProps> = ({
  book,
  tags,
  onBack,
  synopsis = DEFAULT_SYNOPSIS,
}) => {
  const displaySynopsis = book.description?.trim() || synopsis;
  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-cream">
      <div className="paper-grain" />

      {/* Breadcrumbs */}
      <div className="border-b border-primary/10 bg-background-dark/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="text-primary/60 hover:text-primary transition-colors"
            >
              Shelf
            </button>
            <span className="text-primary/40">/</span>
            <span className="text-slate-100 font-medium">{book.title}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-10 lg:gap-14 items-start">
          {/* Left: Book cover */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-[280px] rounded-xl overflow-hidden bg-white shadow-2xl border border-primary/10 p-2">
              <div className="aspect-[2/3] overflow-hidden rounded-lg">
                <img
                  src={book.imageUrl ?? FALLBACK_COVER_URL}
                  alt={book.title}
                  className="object-cover size-full"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== FALLBACK_COVER_URL) {
                      target.src = FALLBACK_COVER_URL;
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Book info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight mb-2">
              {book.title}
            </h1>
            <p className="text-slate-300 text-lg mb-6">by {book.author}</p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-primary/50 text-primary px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <HowThisBookFeels book={book} />

            <section className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                About this reflection
              </h2>
              <p className="text-slate-200 leading-relaxed text-justify">
                {displaySynopsis}
              </p>
            </section>

            <div className="flex flex-wrap gap-4">
              <Button variant="primary" icon="edit_note">
                Write a Reflection
              </Button>
              <Button variant="secondary" icon="library_add">
                Add to My Shelf
              </Button>
            </div>
          </div>
        </div>

        <ReaderReflections />
        <QuoteSection />
      </main>
    </div>
  );
};

export default BookDetail;
