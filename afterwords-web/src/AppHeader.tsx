import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "./routes";

interface AppHeaderProps {
  minimal?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ minimal = false }) => {
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
            <Link
              className="text-xs font-medium text-primary hover:text-white transition-colors uppercase tracking-widest"
              to={ROUTES.home}
            >
              Shelf
            </Link>
            <Link
              className="text-xs font-medium text-primary hover:text-white transition-colors uppercase tracking-widest"
              to={ROUTES.reflections}
            >
              Reflections
            </Link>
            <Link
              className="text-xs font-medium text-primary hover:text-white transition-colors uppercase tracking-widest"
              to={ROUTES.signIn}
            >
              Profile
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
