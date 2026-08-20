import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FALLBACK_COVER_URL, formatRelativeDate, moodTags } from "./bookUtils";
import { fetchMyShelf, type ShelfItem, type ShelfSummary } from "./shelfApi";
import ShelfItemMenu from "./ShelfItemMenu";
import { ROUTES } from "./routes";

type ShelfFilter = "all" | "reading" | "finished" | "wishlist";

const FILTER_OPTIONS: { id: ShelfFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reading", label: "Reading" },
  { id: "finished", label: "Finished" },
  { id: "wishlist", label: "Wishlist" },
];

function filterCount(summary: ShelfSummary | null, filter: ShelfFilter): number {
  if (!summary) return 0;
  if (filter === "all") return summary.totalCount;
  if (filter === "reading") return summary.readingCount;
  if (filter === "finished") return summary.finishedCount;
  return summary.wishlistCount;
}

function progressLabel(item: ShelfItem): string {
  if (item.currentPage && item.totalPages) {
    return `Page ${item.currentPage} / ${item.totalPages}`;
  }
  if (item.startedAt) {
    return `Started ${formatRelativeDate(item.startedAt)} • ${item.progressPercent}%`;
  }
  return `${item.progressPercent}% complete`;
}

const CoverImage: React.FC<{
  imageUrl?: string;
  title: string;
  className?: string;
}> = ({ imageUrl, title, className = "" }) => (
  <img
    src={imageUrl ?? FALLBACK_COVER_URL}
    alt={title}
    className={`object-cover size-full ${className}`.trim()}
    onError={(e) => {
      const target = e.currentTarget;
      if (target.src !== FALLBACK_COVER_URL) {
        target.src = FALLBACK_COVER_URL;
      }
    }}
  />
);

const MyShelfPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ShelfSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ShelfFilter>("all");

  const loadShelf = useCallback(() => {
    setLoading(true);
    setError(null);

    return fetchMyShelf()
      .then((data) => setSummary(data))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load shelf.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadShelf().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [loadShelf]);

  const filteredItems = useMemo(() => {
    if (!summary) return [];
    const query = search.trim().toLowerCase();

    return summary.items.filter((item) => {
      const matchesFilter = filter === "all" || item.status === filter;
      if (!matchesFilter) return false;
      if (!query) return true;

      const tags = moodTags(item).join(" ").toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        tags.includes(query)
      );
    });
  }, [summary, search, filter]);

  const continueReading = filteredItems.filter((item) => item.status === "reading");
  const reflectionWaiting = filteredItems.filter(
    (item) => item.status === "finished" && !item.hasReflection,
  );
  const recentlyAdded = [...filteredItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <main className="pt-10 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <section className="mb-12">
        <h2 className="font-display text-4xl md:text-5xl text-on-surface mb-2 font-bold">
          My Shelf
        </h2>
        <p className="font-display text-xl text-on-surface-variant italic">
          A quiet place for the books that stayed with you.
        </p>
      </section>

      <section className="flex flex-col md:flex-row gap-6 mb-16 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-accent-brass/50 group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="w-full bg-surface-dark border border-white/5 rounded-lg py-3 pl-12 pr-4 text-cream focus:outline-none focus:border-primary/30 transition-all placeholder:text-accent-brass/50 font-sans"
            placeholder="Search title, author or mood..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-surface-container rounded-lg border border-white/5">
          {FILTER_OPTIONS.map((option) => {
            const active = filter === option.id;
            const count = filterCount(summary, option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`px-6 py-2 rounded-lg text-xs uppercase tracking-widest font-bold font-sans transition-all ${
                  active
                    ? "bg-secondary-container text-cream"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {option.label} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {loading && <p className="text-sm text-on-surface-variant mb-8">Loading your shelf…</p>}
      {error && (
        <div className="mb-8 rounded-xl border border-white/10 bg-surface-dark/60 p-6">
          <p className="text-sm text-red-300 mb-4">{error}</p>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <section className="mb-20">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-xs uppercase tracking-widest text-accent-brass font-bold font-sans">
                Recently Added
              </h3>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="text-primary hover:underline text-xs uppercase tracking-widest font-bold font-sans"
              >
                View all
              </button>
            </div>

            {recentlyAdded.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic font-sans">
                No books on your shelf yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {recentlyAdded.map((item) => (
                  <article key={item.id} className="group flex flex-col gap-4">
                    <div className="relative w-full aspect-[2/3] bg-surface-container rounded-lg overflow-hidden shadow-2xl transition-transform duration-300 group-hover:-translate-y-2">
                      <CoverImage imageUrl={item.imageUrl} title={item.title} />
                      {item.status !== "reading" && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-background-dark/80 backdrop-blur rounded text-[10px] text-primary uppercase tracking-wider font-bold border border-white/10">
                          {item.status === "wishlist" ? "Wishlist" : "Finished"}
                        </div>
                      )}
                      {item.status === "reading" && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-primary rounded text-[10px] text-on-primary uppercase tracking-wider font-bold">
                          Reading
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              item.hasReflection && item.reflectionId
                                ? ROUTES.reflection(item.reflectionId)
                                : item.status === "finished"
                                  ? ROUTES.writeReflection(item.bookId)
                                  : ROUTES.book(item.bookId),
                            )
                          }
                          className="w-full py-2 bg-primary text-on-primary text-[10px] uppercase tracking-widest font-bold rounded font-sans"
                        >
                          {item.status === "reading"
                            ? "Continue Reading"
                            : item.status === "finished" && !item.hasReflection
                              ? "Write Reflection"
                              : item.status === "finished"
                                ? "Read Reflection"
                                : "Start Reading"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h5 className="font-display text-lg mb-1 group-hover:text-primary transition-colors truncate">
                            {item.title}
                          </h5>
                          <p className="text-sm text-on-surface-variant font-sans truncate">
                            {item.author}
                          </p>
                        </div>
                        <ShelfItemMenu item={item} onUpdated={loadShelf} />
                      </div>
                      <p className="mt-2 text-[10px] uppercase tracking-widest text-accent-brass/50 font-bold font-sans">
                        Saved {formatRelativeDate(item.createdAt)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {continueReading.length > 0 && (
            <section className="mb-20">
              <h3 className="text-xs uppercase tracking-widest text-accent-brass mb-8 font-bold font-sans">
                Continue Reading
              </h3>
              <div className="flex gap-6 overflow-x-auto pb-8 shelf-scrollbar">
                {continueReading.map((item) => (
                  <article
                    key={item.id}
                    className="flex-shrink-0 flex gap-8 w-full max-w-[480px] p-6 bg-surface-dark/40 rounded-xl border border-white/5 group hover:border-primary/30 transition-all"
                  >
                    <div className="w-32 h-48 bg-surface-container rounded shadow-2xl overflow-hidden flex-shrink-0">
                      <CoverImage imageUrl={item.imageUrl} title={item.title} />
                    </div>
                    <div className="flex flex-col justify-between py-2 flex-grow min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="font-display text-2xl text-on-surface mb-1 font-bold truncate">
                            {item.title}
                          </h4>
                          <ShelfItemMenu item={item} onUpdated={loadShelf} align="left" />
                        </div>
                        <p className="text-base text-on-surface-variant font-sans">{item.author}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {moodTags(item).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] uppercase tracking-wider font-bold text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-accent-brass/60 font-bold font-sans">
                            {progressLabel(item)}
                          </p>
                          <div className="w-full h-1 bg-surface-container-high rounded-full mt-2">
                            <div
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.book(item.bookId))}
                          className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest font-bold font-sans hover:gap-4 transition-all"
                        >
                          Continue
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 bg-primary/10 p-10 rounded-xl border border-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-display text-3xl text-primary mb-4 font-bold">
                  Reflection Waiting
                </h3>
                <p className="text-lg text-on-surface-variant mb-8 leading-relaxed font-sans">
                  Instead of guilt, it&apos;s a gentle reminder. These stories are still settling
                  in your mind.
                </p>
                <span className="material-symbols-outlined text-6xl text-primary/20 absolute -bottom-4 -right-4 select-none">
                  edit_note
                </span>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              {reflectionWaiting.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic font-sans">
                  No reflections waiting right now.
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {reflectionWaiting.slice(0, 2).map((item) => (
                    <article
                      key={item.id}
                      className="p-6 bg-surface-dark border border-white/5 rounded-xl hover:border-primary/30 transition-all flex items-center gap-6"
                    >
                      <div className="w-20 h-28 bg-surface-container rounded overflow-hidden shadow-lg flex-shrink-0">
                        <CoverImage imageUrl={item.imageUrl} title={item.title} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-lg text-on-surface font-bold font-display truncate">
                          {item.title}
                        </h4>
                        <p className="text-sm text-on-surface-variant mb-4 font-sans">
                          Finished {formatRelativeDate(item.finishedAt)} • Still sitting with this
                          story?
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.writeReflection(item.bookId))}
                          className="px-4 py-2 bg-primary text-on-primary text-[10px] uppercase tracking-widest font-bold rounded hover:brightness-110 active:scale-95 transition-all font-sans"
                        >
                          Write Reflection
                        </button>
                      </div>
                      <ShelfItemMenu item={item} onUpdated={loadShelf} />
                    </article>
                  ))}
                </div>
              )}
              {reflectionWaiting.length > 2 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setFilter("finished")}
                    className="text-primary hover:underline text-xs uppercase tracking-widest font-bold font-sans flex items-center gap-2"
                  >
                    View all waiting reflections
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default MyShelfPage;
