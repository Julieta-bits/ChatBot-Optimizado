import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/chat", label: "Chat Tutor", icon: "chat", mobileIcon: "forum" },
  { to: "/dashboard", label: "Teacher Dashboard", icon: "dashboard", mobileIcon: "analytics" },
  { to: "/evaluation", label: "Learning Progress", icon: "insights", mobileIcon: "query_stats" },
] as const;

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-sm flex justify-between items-center px-margin-mobile md:px-margin-desktop py-base">
      <Link to="/" className="flex items-center gap-sm">
        <Icon name="smart_toy" className="text-primary" style={{ fontSize: 28 }} fill />
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">EduBot</h1>
      </Link>
      <div className="bg-inverse-surface text-inverse-on-surface px-md py-xs rounded-full font-id-marker text-id-marker">
        ID: #134
      </div>
    </header>
  );
}

export function SideNav() {
  const location = useLocation();
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-80 bg-surface-container-low border-r border-outline-variant flex-col z-40 pt-24">
      <div className="px-md py-lg border-b border-outline-variant mb-md">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
            <Icon name="person" className="text-on-primary-container" />
          </div>
          <div>
            <h2 className="font-label-md text-label-md text-on-surface">Anonymous User</h2>
            <p className="text-xs text-on-surface-variant">ID: #134</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 flex flex-col px-sm">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-full mx-sm my-xs px-md py-sm flex items-center gap-sm transition-all duration-200 active:scale-95",
                active
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-variant",
              )}
            >
              <Icon name={item.icon} fill={active} />
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
        <div className="mt-auto mb-md text-on-surface-variant hover:bg-surface-variant rounded-full mx-sm px-md py-sm flex items-center gap-sm cursor-pointer">
          <Icon name="settings" />
          <span className="font-label-md text-label-md">Settings</span>
        </div>
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-gutter md:hidden bg-surface shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 rounded-t-xl border-t border-outline-variant/40">
      {navItems.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center px-sm py-xs rounded-xl active:scale-90 transition-transform duration-150",
              active
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:text-primary",
            )}
          >
            <Icon name={item.mobileIcon} fill={active} />
            <span className="font-label-md text-[10px]">{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <SideNav />
      <main className="md:pl-80 pt-24 pb-24 md:pb-8 px-margin-mobile md:px-margin-desktop">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
