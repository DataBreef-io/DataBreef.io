import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeVariant = "reef" | "kelp" | "coral" | "urchin" | "neutral" | "biolum";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[`variant-${variant}`], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
