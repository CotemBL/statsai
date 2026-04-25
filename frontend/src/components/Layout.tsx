import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { fetchAuthMe } from "../api/queries";
import type { AuthMe } from "../api/client";

const navItems = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/heroes", label: "Heroes", icon: "⚔️" },
];

const apiBase = import.meta.env.VITE_API_BASE || "/api";

export default function Layout() {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuthMe()
      .then(setMe)
      .catch(() => setMe({ authenticated: false }));
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (/^\d+$/.test(q)) {
      navigate(`/players/${q}`);
    } else {
      navigate(`/?search=${encodeURIComponent(q)}`);
    }
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 bg-bg-card/60 border-r border-white/5 px-4 py-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center font-extrabold text-white">
            D
          </div>
          <span className="text-lg font-extrabold tracking-wide">DotaDash</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm font-medium ${
                  isActive
                    ? "bg-accent-purple/20 text-white"
                    : "text-text-muted hover:bg-bg-hover hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-white/5 text-xs text-text-dim">
          Powered by OpenDota API
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-bg/70 backdrop-blur border-b border-white/5 px-6 py-3 flex items-center gap-4">
          <form onSubmit={onSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Steam32 ID or nickname…"
                className="w-full bg-bg-card border border-white/10 rounded-lg px-4 py-2 pl-10 placeholder:text-text-dim focus:outline-none focus:border-accent-purple"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
                🔍
              </span>
            </div>
          </form>

          {me?.authenticated ? (
            <div className="flex items-center gap-3">
              {me.avatar && (
                <img
                  src={me.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full border border-white/10"
                />
              )}
              <span className="text-sm">{me.personaname}</span>
              {me.account_id && (
                <button
                  onClick={() => navigate(`/players/${me.account_id}`)}
                  className="text-xs text-accent-purple2 hover:underline"
                >
                  My profile
                </button>
              )}
              <a
                href={`${apiBase}/auth/logout`}
                className="text-xs text-text-muted hover:text-white"
              >
                Logout
              </a>
            </div>
          ) : (
            <a
              href={`${apiBase}/auth/steam/login`}
              className="flex items-center gap-2 bg-[#171a21] hover:bg-[#1f2330] border border-white/10 px-3 py-1.5 rounded-lg text-sm"
            >
              <img
                src="https://community.fastly.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
                alt="Sign in through Steam"
                className="h-6"
              />
            </a>
          )}
        </header>

        <div className="px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
