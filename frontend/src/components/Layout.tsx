import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <header className="bg-cream-100 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-semibold text-slate-900 hover:text-primary-600 transition-colors duration-200"
          >
            Wod Result
          </Link>
          <Link
            to="/workout/create"
            className="bg-primary-600 text-white px-6 py-2.5 rounded hover:bg-primary-700 transition-all duration-200 ease-out font-medium hover:scale-105"
          >
            + Nowy workout
          </Link>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 flex-1">
        {children}
      </main>

      <footer className="bg-cream-100 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-slate-700 text-sm">
          Stworzone przez barwy z <span className="heartbeat">❤️</span> do Crossfit
        </div>
      </footer>
    </div>
  );
}
