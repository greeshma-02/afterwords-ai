import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  authorInitial,
  fetchReflectionsByBook,
  formatReflectionCardDate,
  reflectionQuote,
  type ApiReflection,
} from "./reflectionApi";
import { ROUTES } from "./routes";

interface ReaderReflectionsProps {
  bookId: number;
}

const ReaderReflections: React.FC<ReaderReflectionsProps> = ({ bookId }) => {
  const [reflections, setReflections] = useState<ApiReflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchReflectionsByBook(bookId)
      .then((data) => {
        if (!cancelled) setReflections(data);
      })
      .catch(() => {
        if (!cancelled) setReflections([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 mb-14">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-100 font-display italic">
          Reader Reflections
        </h3>
      </div>

      {loading && <p className="text-sm text-slate-400 mb-4">Loading reflections…</p>}

      {!loading && reflections.length === 0 && (
        <p className="text-sm text-slate-400 italic">
          No public reflections yet. Be the first to share yours.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reflections.map((reflection) => (
          <article
            key={reflection.id}
            className="rounded-xl bg-slate-800/60 border border-primary/10 p-6 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {authorInitial(reflection.authorName)}
              </div>
              <div>
                <p className="font-semibold text-slate-100">{reflection.authorName}</p>
                <p className="text-xs text-slate-400">
                  {formatReflectionCardDate(reflection.createdAt)}
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.reflection(reflection.id)}
              className="text-slate-200 italic text-sm leading-relaxed flex-1 hover:text-primary transition-colors"
            >
              &ldquo;{reflectionQuote(reflection.body)}&rdquo;
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ReaderReflections;
