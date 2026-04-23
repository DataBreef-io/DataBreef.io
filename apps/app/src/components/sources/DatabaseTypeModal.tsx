"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Loader2 } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { Button } from "@/components/ui/Button";
import {
  ClassificationResult,
  DatabaseType,
  DATABASE_TYPE_LABELS,
  getMatchedSignals,
} from "@/lib/dib/classifier";
import { saveDatabaseTypeAction } from "./classifyActions";
import styles from "./DatabaseTypeModal.module.css";

const CONFIDENCE_THRESHOLD = 75;

// Refinement question options → DatabaseType mapping
const USE_CASE_MAP: Record<string, DatabaseType> = {
  "Customer management": "CRM",
  "Sales & revenue": "CRM",
  "Data analysis": "Analytics",
  "User authentication": "UserManagement",
  "Operations & logistics": "Transactional",
  "E-commerce": "Transactional",
  "Other": "Custom",
};

const REFINEMENT_OPTIONS = Object.keys(USE_CASE_MAP);

interface Props {
  sourceId: string;
  classification: ClassificationResult;
  tableNames: string[];
  onDone: () => void;
}

type View = "confirm" | "refine" | "saving";

export function DatabaseTypeModal({ sourceId, classification, tableNames, onDone }: Props) {
  const isHighConfidence = classification.confidence > CONFIDENCE_THRESHOLD;
  const [view, setView] = useState<View>(isHighConfidence ? "confirm" : "refine");
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const signals =
    classification.type !== "Custom"
      ? getMatchedSignals(tableNames, classification.type)
      : [];

  async function save(type: DatabaseType) {
    setView("saving");
    try {
      await saveDatabaseTypeAction(sourceId, type);
      onDone();
    } catch {
      setError("Failed to save. You can set this later in source settings.");
      onDone();
    }
  }

  function handleConfirm() {
    save(classification.type);
  }

  function handleRefineSubmit() {
    if (!selectedUseCase) return;
    const type = USE_CASE_MAP[selectedUseCase] ?? "Custom";
    save(type);
  }

  return (
    <Portal>
      <div className={styles.overlay}>
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.header}>
            <Compass className={styles.icon} />
            <h3 className={styles.title}>Classify your Reef</h3>
          </div>

          <AnimatePresence mode="wait">
            {view === "confirm" && (
              <motion.div key="confirm" className={styles.body} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className={styles.detected}>
                  We detected a{" "}
                  <span className={styles.typeLabel}>{DATABASE_TYPE_LABELS[classification.type]}</span>{" "}
                  database{" "}
                  <span className={styles.confidence}>({classification.confidence}% confident)</span>
                </p>
                {signals.length > 0 && (
                  <div className={styles.signals}>
                    <p className={styles.signalsLabel}>Signal tables found:</p>
                    <div className={styles.signalTags}>
                      {signals.slice(0, 6).map(s => (
                        <span key={s} className={styles.tag}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className={styles.actions}>
                  <Button onClick={handleConfirm} variant="primary">Yes, that&apos;s right</Button>
                  <Button onClick={() => setView("refine")} variant="secondary">No, let me specify</Button>
                </div>
              </motion.div>
            )}

            {view === "refine" && (
              <motion.div key="refine" className={styles.body} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className={styles.description}>
                  {isHighConfidence
                    ? "What best describes the primary use case for this database?"
                    : `No strong pattern detected (${classification.confidence}% confidence). What best describes this database?`}
                </p>
                <div className={styles.optionList}>
                  {REFINEMENT_OPTIONS.map(opt => (
                    <label key={opt} className={`${styles.option} ${selectedUseCase === opt ? styles.selected : ""}`}>
                      <input
                        type="radio"
                        name="useCase"
                        value={opt}
                        checked={selectedUseCase === opt}
                        onChange={() => setSelectedUseCase(opt)}
                        className={styles.hiddenRadio}
                      />
                      <span className={styles.optionDot} />
                      {opt}
                    </label>
                  ))}
                </div>
                <div className={styles.actions}>
                  <Button onClick={handleRefineSubmit} variant="primary" disabled={!selectedUseCase}>
                    Confirm
                  </Button>
                  {isHighConfidence && (
                    <Button onClick={() => setView("confirm")} variant="secondary">Back</Button>
                  )}
                </div>
                {error && <p className={styles.error}>{error}</p>}
              </motion.div>
            )}

            {view === "saving" && (
              <motion.div key="saving" className={styles.savingState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Loader2 className={styles.spinner} />
                <p>Classifying reef…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Portal>
  );
}
