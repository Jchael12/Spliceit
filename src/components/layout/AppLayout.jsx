import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CircleDollarSign,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { Avatar, Count, IconButton } from "@plop-ui/react";
import { useApp } from "../../context/AppContext";
import HelpGuide from "../HelpGuide";
import Logo from "./Logo";

const HELP_KEY = "splitink.help.seen";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/balances", label: "Balances", icon: CircleDollarSign },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_ITEMS = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/balances", label: "Balances", icon: CircleDollarSign },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavItem({ item, unreadCount, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-[13px] border-[2.5px] px-3 py-2.5 text-[15px] font-bold no-underline transition-colors",
          isActive
            ? "border-ink bg-[var(--plop-mustard)] paper-ink shadow-[3px_4px_0_var(--plop-shadow)]"
            : "border-transparent chrome-ink chrome-hover",
        ].join(" ")
      }
    >
      <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.to === "/notifications" && unreadCount > 0 ? (
        <Count size="sm" tone="tomato" label={`${unreadCount} unread notifications`}>
          {unreadCount}
        </Count>
      ) : null}
    </NavLink>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { unreadCount, currentUser } = useApp();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(HELP_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    setHelpOpen(true);
    try {
      window.localStorage.setItem(HELP_KEY, "1");
    } catch {
      // The guide still works when storage is unavailable.
    }
  }, []);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-[2.5px] border-chrome bg-[var(--app-chrome)] px-4 py-5 lg:flex xl:w-72">
        <div className="px-1">
          <Logo />
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate("/expenses/new")}
            className="flex w-full items-center justify-center gap-2 rounded-[16px_12px_17px_11px] border-[2.5px] border-ink bg-[var(--plop-tomato)] px-4 py-3 font-bold text-[var(--plop-on-fill-tomato)] shadow-[4px_5px_0_var(--plop-shadow)] transition-transform hover:-rotate-1 active:translate-y-[2px] active:shadow-none"
            style={{ fontFamily: "var(--plop-font-letter)", fontStyle: "italic" }}
          >
            <Plus size={21} strokeWidth={2.8} />
            Add expense
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1.5" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} unreadCount={unreadCount} />
          ))}
        </nav>

        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="chrome-tint mb-3 flex w-full items-center gap-3 rounded-[13px] border-[2.5px] border-dashed border-[var(--plop-periwinkle)] px-3 py-2.5 text-left text-[14px] font-bold chrome-ink transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border-2 border-ink bg-[var(--plop-mustard)] paper-ink">
              <HelpCircle size={18} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              Help &amp; guide
              <span className="chrome-soft block text-[11px] font-bold">
                New here? Take the tour.
              </span>
            </span>
          </button>
          <p className="chrome-soft mb-3 px-2 text-[12px] leading-snug">
            Split bills, keep friends. Every number adds up.
          </p>
          <NavLink
            to="/settings"
            className="flex items-center gap-3 rounded-[14px] border-[2.5px] border-ink bg-[var(--plop-paper)] p-2.5 no-underline shadow-[3px_4px_0_var(--plop-shadow)]"
          >
            <Avatar name={currentUser.name} size="sm" status="online" />
            <span className="min-w-0">
              <span className="paper-ink block truncate text-sm font-bold">
                {currentUser.name}
              </span>
              <span className="paper-soft block truncate text-[12px]">
                {currentUser.email}
              </span>
            </span>
          </NavLink>
        </div>
      </aside>

      <div className="lg:pl-64 xl:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b-[2.5px] border-chrome bg-[var(--app-chrome)] px-4 py-2.5 lg:hidden">
          <Logo compact />
          <div className="flex items-center gap-2">
            <NavLink
              to="/notifications"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              className="relative grid h-10 w-10 place-items-center rounded-full border-[2.5px] border-ink bg-[var(--plop-paper)] paper-ink no-underline"
            >
              <Bell size={20} strokeWidth={2.2} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5">
                  <Count size="sm" label={`${unreadCount} unread`}>
                    {unreadCount}
                  </Count>
                </span>
              ) : null}
            </NavLink>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Help and getting started"
              className="grid h-10 w-10 place-items-center rounded-full border-[2.5px] border-ink bg-[var(--plop-mustard)] paper-ink"
            >
              <HelpCircle size={20} strokeWidth={2.2} aria-hidden="true" />
            </button>
            <NavLink to="/settings" aria-label="Your profile">
              <Avatar name={currentUser.name} size="sm" />
            </NavLink>
          </div>
        </header>

        <main className="page-bottom-space mx-auto w-full max-w-[1180px] px-4 pb-6 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t-[2.5px] border-chrome bg-[var(--app-chrome)] px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-1 py-1.5">
          {MOBILE_ITEMS.slice(0, 2).map((item) => (
            <MobileNavItem key={item.to} item={item} />
          ))}

          <div className="-mt-5 px-1">
            <IconButton
              icon={<Plus size={23} strokeWidth={2.8} />}
              label="Add expense"
              variant="tomato"
              size="md"
              onClick={() => navigate("/expenses/new")}
            />
          </div>

          {MOBILE_ITEMS.slice(2).map((item) => (
            <MobileNavItem key={item.to} item={item} />
          ))}
        </div>
      </nav>

      <HelpGuide open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function MobileNavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          "flex min-w-[58px] flex-col items-center gap-0.5 rounded-[10px] px-2 py-1.5 text-[10px] font-bold no-underline",
          isActive
            ? "paper-ink bg-[var(--plop-mustard)]"
            : "chrome-soft chrome-hover",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={21}
            strokeWidth={isActive ? 2.6 : 2.1}
            aria-hidden="true"
          />
          {item.label}
        </>
      )}
    </NavLink>
  );
}
