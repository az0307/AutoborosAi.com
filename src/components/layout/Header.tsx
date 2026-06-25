import { History, Settings, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";

interface HeaderProps {
  onHistoryToggle: () => void;
}

export default function Header({ onHistoryToggle }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getOAuthUrl = () => {
    const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
    const appID = import.meta.env.VITE_APP_ID;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);
    const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
    url.searchParams.set("client_id", appID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "profile");
    url.searchParams.set("state", state);
    return url.toString();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30"
      style={{
        background: "rgba(9, 9, 11, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-5 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="font-brand text-[20px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              NEXUS
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--status-dot)" }}
            />
            <span className="text-[var(--text-secondary)]">All systems active</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onHistoryToggle}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
            title="History"
          >
            <History size={18} className="text-[var(--text-secondary)]" />
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-blue)] flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                )}
                <span className="text-[12px] font-medium text-[var(--text-primary)]">
                  {user?.name || "User"}
                </span>
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 top-full mt-1 w-40 rounded-lg overflow-hidden py-1"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href={getOAuthUrl()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
              style={{
                background: "var(--accent-blue)",
                color: "white",
              }}
            >
              <LogIn size={14} />
              Connect
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
