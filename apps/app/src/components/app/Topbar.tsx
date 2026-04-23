"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./Topbar.module.css";

const PAGE_META: Record<string, { eyebrow: string; title: string; cta?: { label: string; href: string } }> = {
  "/dashboard": {
    eyebrow: "Reef Overview",
    title: "Dashboard",
  },
  "/sources": {
    eyebrow: "Data Sources",
    title: "Connected Reefs",
    cta: { label: "Anchor a source", href: "/sources/new" },
  },
  "/dibs": {
    eyebrow: "Intelligence Briefs",
    title: "Brief History",
  },
  "/settings": {
    eyebrow: "Configuration",
    title: "Settings",
  },
};

function getCurrentMeta(pathname: string) {
  // Find the closest matching key
  const key = Object.keys(PAGE_META)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return key
    ? PAGE_META[key]
    : { eyebrow: "DataBreef", title: "Page" };
}

export function Topbar() {
  const pathname = usePathname();
  const meta = getCurrentMeta(pathname);

  return (
    <header className={styles.topbar} role="banner">
      <div className={styles.inner}>
        {/* Page context */}
        <div className={styles.context}>
          <p className={styles.eyebrow}>{meta.eyebrow}</p>
          <h1 className={styles.title}>{meta.title}</h1>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {meta.cta && (
            <Button href={meta.cta.href} size="sm" id="topbar-cta">
              <Plus size={14} aria-hidden="true" />
              {meta.cta.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
