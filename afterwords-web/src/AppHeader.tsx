import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getStoredAuth, type AuthUser } from "./authApi";
import { useAuthPrompt } from "./authPrompt";
import { ROUTES } from "./routes";

interface AppHeaderProps {
  minimal?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ minimal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { promptLogin } = useAuthPrompt();
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuth());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getStoredAuth());
  }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setProfileOpen(false);
    navigate(ROUTES.home);
  };

  const navLinkClass =
    "text-xs font-medium text-primary hover:text-white transition-colors uppercase tracking-widest";

  return (
    <header className="border-b border-white/5 px-4 py-4 sm:px-6 lg:px-12 backdrop-blur-md sticky top-0 z-50 bg-background-dark/80">
      <div
        className={`flex items-center w-full ${
          minimal ? "justify-start" : "max-w-7xl mx-auto justify-between"
        }`}
      >
        <Link className="flex items-center gap-3" to={ROUTES.home}>
          <div className="h-10 w-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">
              auto_stories
            </span>
          </div>
          <span className="font-display italic tracking-tight font-bold text-3xl text-[rgb(212_175_55_/var(--tw-text-opacity,_1))]">
            Afterwords
          </span>
        </Link>
        {!minimal && (
          <nav className="flex items-center gap-8">
            {user ? (
              <Link className={navLinkClass} to={ROUTES.shelf}>
                Shelf
              </Link>
            ) : (
              <button
                type="button"
                className={navLinkClass}
                onClick={() =>
                  promptLogin({
                    returnTo: ROUTES.shelf,
                    title: "Sign in to view your shelf",
                    message:
                      "Your shelf is personal. Sign in to save books and track what you are reading.",
                  })
                }
              >
                Shelf
              </button>
            )}
            {user ? (
              <Link className={navLinkClass} to={ROUTES.reflections}>
                Reflections
              </Link>
            ) : (
              <button
                type="button"
                className={navLinkClass}
                onClick={() =>
                  promptLogin({
                    returnTo: ROUTES.reflections,
                    title: "Sign in to view your reflections",
                    message:
                      "Sign in to write and revisit the reflections that stayed with you.",
                  })
                }
              >
                Reflections
              </button>
            )}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className={navLinkClass}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  Profile
                </button>
                {profileOpen && (
                  <div
                    className="absolute right-0 mt-3 w-56 rounded-xl border border-white/10 bg-surface-dark shadow-2xl overflow-hidden"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-bold text-cream font-sans truncate">
                        {user.fullName || "Reader"}
                      </p>
                      <p className="text-xs text-on-surface-variant font-sans truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm font-sans text-cream hover:bg-primary/10 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base text-primary/80">
                        logout
                      </span>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link className={navLinkClass} to={ROUTES.signIn}>
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
