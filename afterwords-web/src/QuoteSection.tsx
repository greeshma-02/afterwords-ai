import React from "react";

const QuoteSection: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center border-t border-primary/10">
      <div className="border-b border-slate-500/40 pb-8 mb-8" />
      <blockquote className="text-2xl md:text-3xl font-display italic text-primary leading-relaxed mb-6">
        &ldquo;I have always imagined that Paradise will be a kind of library.&rdquo;
      </blockquote>
      <cite className="block text-sm uppercase tracking-widest text-slate-500 font-sans">
        — Jorge Luis Borges
      </cite>
    </section>
  );
};

export default QuoteSection;
