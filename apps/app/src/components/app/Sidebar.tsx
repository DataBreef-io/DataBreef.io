"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  ScrollText,
  Settings,
  LogOut,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { signOutAction } from "@/app/auth/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/sources", label: "Sources", icon: Database },
  { href: "/dibs", label: "Briefs", icon: ScrollText },
] as const;

interface SidebarProps {
  userEmail?: string;
  userName?: string;
}

export function Sidebar({ userEmail = "user@example.com", userName }: SidebarProps) {
  const pathname = usePathname();
  const displayName = userName || userEmail?.split("@")[0] || "User";

  return (
    <aside className={styles.sidebar} aria-label="Application navigation">
      <div className={styles.inner}>
        {/* ── Brand ── */}
        <div className={styles.brand}>
          <Link href="/dashboard" className={styles.brandLink} aria-label="DataBreef home">
            <span className={styles.brandName}>
              <span className={styles.brandData}>Data</span>
              <span className={styles.brandBreef}>Breef</span>
            </span>
            <span className={styles.brandTagline}>Your schema, surfaced.</span>
          </Link>
        </div>

        {/* ── Nav ── */}
        <nav className={styles.nav}>
          <span className={styles.navSection}>Explore</span>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                id={`nav-${label.toLowerCase()}`}
                className={[styles.navItem, isActive ? styles.navItemActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={18}
                  className={styles.navIcon}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <div className={styles.userSection}>
            <div className={styles.userAvatar} aria-hidden="true">{displayName.charAt(0).toUpperCase()}</div>
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{userEmail}</span>
            </div>
          </div>

          <div className={styles.footerActions}>
            <Link href="/settings" className={styles.footerItem} id="nav-settings">
              <Settings size={14} aria-hidden="true" />
              <span>Settings</span>
            </Link>
            <form action={signOutAction}>
              <button className={styles.footerItem} id="nav-sign-out" type="submit">
                <LogOut size={14} aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
