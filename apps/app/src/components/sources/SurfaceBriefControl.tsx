/**
 * apps/app/src/components/sources/SurfaceBriefControl.tsx
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, Waves, Check } from "lucide-react";
import { discoverSchemasAction, updateSourceSchemasAction, surfaceBriefAction } from "@/components/dibs/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/Portal";
import styles from "./SurfaceBriefControl.module.css";

interface SurfaceBriefControlProps {
  sourceId: string;
}

export function SurfaceBriefControl({ sourceId }: SurfaceBriefControlProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [diverging, setDiverging] = useState(false);

  async function handleInitialClick() {
    setLoading(true);
    try {
      const found = await discoverSchemasAction(sourceId);
      setSchemas(found);
      setSelected(found); // Default to all
      setShowModal(true);
    } catch (err) {
      console.error("Discovery failed", err);
      // Fallback: Just dive
      await surfaceBriefAction(sourceId);
    } finally {
      setLoading(false);
    }
  }

  // Handle countdown
  useEffect(() => {
    if (showModal && countdown > 0 && !diverging) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showModal && countdown === 0 && !diverging) {
      handleFinalDive();
    }
  }, [showModal, countdown, diverging]);

  async function handleFinalDive() {
    setDiverging(true);
    // Persist preferences
    await updateSourceSchemasAction(sourceId, selected);
    // Trigger dive
    await surfaceBriefAction(sourceId);
  }

  const toggleSchema = (s: string) => {
    setSelected(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  return (
    <>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleInitialClick}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={14} /> : "Surface a brief"}
      </Button>

      <AnimatePresence>
        {showModal && (
          <Portal>
            <div className={styles.overlay}>
              <motion.div 
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className={styles.header}>
                  <Waves className={styles.icon} />
                  <h3 className={styles.title}>Refine the Dive</h3>
                </div>
                
                <p className={styles.description}>
                  Select the ecosystems (schemas) you wish to analyze. 
                  Diving in <span className={styles.timer}>{countdown}s</span>...
                </p>

                <div className={styles.schemaList}>
                  {schemas.map(s => (
                    <label key={s} className={styles.schemaItem}>
                      <input 
                        type="checkbox" 
                        checked={selected.includes(s)} 
                        onChange={() => toggleSchema(s)}
                        className={styles.hiddenCheckbox}
                      />
                      <div className={`${styles.customCheckbox} ${selected.includes(s) ? styles.checked : ""}`}>
                        {selected.includes(s) && <Check size={12} />}
                      </div>
                      <span>{s}</span>
                    </label>
                  ))}
                </div>

                <div className={styles.actions}>
                  <Button 
                    variant="reef" 
                    fullWidth 
                    onClick={handleFinalDive}
                    disabled={diverging}
                  >
                    {diverging ? <Loader2 className="animate-spin" /> : "Dive Now"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
