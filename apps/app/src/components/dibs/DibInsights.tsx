import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, CheckCircle2, Info, ArrowUpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DibInsights.module.css";

export type Insight = {
  severity: "critical" | "high" | "med" | "low";
  title: string;
  description: string;
  recommendation: string;
  entities?: string[];
};

interface DibInsightsProps {
  insights: Insight[];
}

const severityMap = {
  critical: { variant: "urchin", icon: <AlertCircle size={16} /> },
  high: { variant: "urchin", icon: <ArrowUpCircle size={16} /> },
  med: { variant: "reef", icon: <Info size={16} /> },
  low: { variant: "kelp", icon: <CheckCircle2 size={16} /> },
} as const;

export function DibInsights({ insights }: DibInsightsProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (insights.length === 0) return null;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Actionable Insights</h3>
      <div className={styles.grid}>
        {insights.map((insight, idx) => {
          const { variant, icon } = severityMap[insight.severity];
          const isExpanded = expandedIdx === idx;
          const hasEntities = insight.entities && insight.entities.length > 0;

          return (
            <Card 
              key={idx} 
              className={`${styles.card} ${isExpanded ? styles.expanded : ""} ${hasEntities ? styles.interactive : ""}`}
              onClick={() => hasEntities && setExpandedIdx(isExpanded ? null : idx)}
            >
              <div className={styles.header}>
                <div className={styles.titleWrap}>
                  <span className={styles.icon}>{icon}</span>
                  <h4 className={styles.title}>{insight.title}</h4>
                </div>
                <div className={styles.headerRight}>
                  <Badge variant={variant as any}>{insight.severity.toUpperCase()}</Badge>
                  {hasEntities && (
                    <span className={styles.chevron}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  )}
                </div>
              </div>
              
              <p className={styles.description}>{insight.description}</p>
              
              <AnimatePresence>
                {isExpanded && hasEntities && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={styles.entitiesList}
                  >
                    <span className={styles.entitiesLabel}>Affected Entities:</span>
                    <div className={styles.tagCloud}>
                      {insight.entities!.map(e => {
                        const hasSchema = e.includes(".");
                        const [schema, name] = hasSchema ? e.split(".") : [null, e];
                        return (
                          <span key={e} className={styles.entityTag}>
                            {hasSchema ? (
                              <span className={styles.qualifiedName}>
                                <span className={styles.schemaPrefix}>{schema}</span>
                                <span className={styles.dotTrigger}>.</span>
                                <span>{name}</span>
                              </span>
                            ) : e}
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={styles.recommendation}>
                <span className={styles.recLabel}>Recommendation:</span>
                <p className={styles.recText}>{insight.recommendation}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
