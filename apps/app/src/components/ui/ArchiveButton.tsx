"use client";

import { useState } from "react";
import { Archive, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ArchiveButton.module.css";

interface ArchiveButtonProps {
  id: string;
  type: "Source" | "Brief";
  onArchive: (id: string) => Promise<void>;
}

export function ArchiveButton({ id, type, onArchive }: ArchiveButtonProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showConfirm) {
      setShowConfirm(true);
      setShowTooltip(false);
      return;
    }

    setIsArchiving(true);
    try {
      await onArchive(id);
    } catch (err) {
      console.error("Archive failure:", err);
      setShowConfirm(false);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={handleArchive}
        onMouseEnter={() => !showConfirm && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isArchiving}
        aria-label={`Archive ${type}`}
      >
        {isArchiving ? (
          <Loader2 size={16} className="animate-spin" />
        ) : showConfirm ? (
          <span className={styles.confirmText}>Archive?</span>
        ) : (
          <Archive size={16} />
        )}
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
          >
            <div className={styles.tooltipArrow} />
            <div className={styles.tooltipContent}>
              <p className={styles.tooltipTitle}>Archive this {type}?</p>
              <p className={styles.tooltipText}>Hides it from view. Go to <span>Settings &gt; Archive</span> to permanently delete.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
