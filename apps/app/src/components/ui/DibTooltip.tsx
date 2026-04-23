"use client";

import React from "react";
import styles from "./DibTooltip.module.css";

/**
 * DibTooltip (React/Next.js)
 * Provides a consistent definition popover for the term "Dib" or "Dibs".
 */
interface DibTooltipProps {
  children: React.ReactNode;
  noUnderline?: boolean;
}

export function DibTooltip({ children, noUnderline = false }: DibTooltipProps) {
  return (
    <span 
      className={`${styles.tooltipWrapper} ${noUnderline ? styles.noUnderline : ""}`}
      tabIndex={0}
    >
      {children}
      <span className={styles.tooltipBox} role="tooltip">
        <strong className={styles.tooltipTitle}>Data Intelligence Brief</strong>
        <span className={styles.tooltipBody}>
          A comprehensive, AI-generated schema report of your data reef.
        </span>
      </span>
    </span>
  );
}
