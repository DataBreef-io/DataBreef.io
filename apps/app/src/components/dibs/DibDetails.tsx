"use client";

import { DibCharts } from "./DibCharts";
import { DibInsights, Insight } from "./DibInsights";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, Loader2, RefreshCcw, ShieldAlert, Heart, Zap, Info } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import styles from "./DibDetails.module.css";

interface DibContent {
  stats: {
    tableCount: number;
    relationCount: number;
    totalSizeBytes: number;
    introspectionTimeMs: number;
    totalRows?: number;
  };
  insights: Insight[];
  charts: {
    sizeDistribution: Array<{ name: string; value: number }>;
    rowCounts: Array<{ name: string; count: number }>;
  };
  narrative?: {
    executiveSummary: string;
    dataLandscape?: string;
    schemaSummary?: string;
    keyMetrics?: Array<{ label: string; value: string; hint?: string }>;
    trends?: Array<{ title: string; insights: string[] }>;
    recommendations?: Array<{ priority: "critical" | "high" | "med"; label: string; task: string }>;
    strategicAnomalies?: any[];
  };
  tables?: any[];
}

interface DibDetailsProps {
  dib: {
    id: string;
    title: string;
    summary: string;
    status: "pending" | "completed" | "error";
    contentJson: any;
    errorLog?: string | null;
    sourceName?: string;
    generatedAt?: string;
  };
}

export function DibDetails({ dib }: DibDetailsProps) {
  const isPending = dib.status === "pending";
  const isError = dib.status === "error";

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.div 
            key="pending"
            className={styles.loadingState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.scannerWrap}>
              <Waves className={styles.scannerIcon} size={48} />
              <motion.div 
                className={styles.scanBar}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <h2 className={styles.loadingTitle}>Diving into the Reef...</h2>
            <p className={styles.loadingSub}>Scanning depths and surfacing actionable intelligence.</p>
            <div className={styles.statusRow}>
              <Loader2 className={styles.spinner} size={14} />
              <span>Introspecting schema...</span>
            </div>
          </motion.div>
        ) : isError ? (
          <motion.div key="error" className={styles.errorState}>
            <div className={styles.errorIconWrap}>
              <RefreshCcw size={32} />
            </div>
            <h2 className={styles.errorTitle}>The dive was interrupted</h2>
            <p className={styles.errorText}>{dib.errorLog || "An unknown error occurred while introspecting the source."}</p>
          </motion.div>
        ) : (
          (() => {
            const content = dib.contentJson as DibContent;
            const narrative = content.narrative;
            const insights = content.insights || [];
            const charts = content.charts || { sizeDistribution: [], rowCounts: [] };
            const ecosystems = narrative?.ecosystems || [];
            const anomalies = (narrative?.strategicAnomalies || []) as { level: string; title: string; description: string; type: string }[];
            
            // Extract top tables for health summary
            const tables = content.tables || [];
            const healthTables = tables
              .sort((a: any, b: any) => (b.metrics?.rowCount ?? 0) - (a.metrics?.rowCount ?? 0))
              .slice(0, 8);

            return (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.contentScroll}
              >
                {/* 1. Header & Quick Summary */}
                <header className={styles.header}>
                  <div className={styles.titleArea}>
                    <div className={styles.idBadge}>DIB #{dib.id.slice(0, 8)}</div>
                    <h1 className={styles.title}>{dib.title}</h1>
                    <p className={styles.meta}>
                      Source: <span className={styles.highlight}>{dib.sourceName || "External Reef"}</span> &middot; 
                      Generated {new Date(dib.generatedAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                  <div className={styles.headerActions}>
                    <Button variant="outline" size="sm">Regenerate</Button>
                    <Button variant="reef" size="sm">Download PDF</Button>
                  </div>
                </header>

                {/* 2. Executive Summary */}
                {narrative?.executiveSummary && (
                  <section className={styles.narrativeSection}>
                    <h2 className={styles.sectionTitle}>Executive Summary</h2>
                    <div className={styles.summaryText}>
                      {narrative.executiveSummary}
                    </div>
                  </section>
                )}

                {/* 2.1. Strategic Anomalies (AI Generated) */}
                {anomalies.length > 0 && (
                  <section className={styles.anomaliesSection}>
                    <h2 className={styles.sectionTitle}>Strategic Anomalies</h2>
                    <div className={styles.anomalyList}>
                      {anomalies.map((a, i) => (
                        <div key={i} className={`${styles.anomalyCard} ${styles[a.level]}`}>
                          <div className={styles.anomalyHeader}>
                            <h3 className={styles.anomalyTitle}>{a.title}</h3>
                            <ShieldAlert size={18} className={styles[a.level]} />
                          </div>
                          <p className={styles.anomalyDesc}>{a.description}</p>
                          <div style={{ marginTop: '12px' }}>
                            <Badge variant={a.level === "critical" ? "urchin" : "reef"}>
                              {a.level.toUpperCase()} {a.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 2.2. Smart Schema Summary (Multi-Schema) */}
                {narrative?.schemaSummary && (
                  <section className={styles.schemaHighlights}>
                    <div className={styles.schemaIconBox}>
                      <Waves size={20} className={styles.wavesIcon} />
                    </div>
                    <div className={styles.schemaBrief}>
                      <h3 className={styles.schemaTitle}>Ecosystem Governance</h3>
                      <p className={styles.schemaSummaryText}>{narrative.schemaSummary}</p>
                    </div>
                  </section>
                )}

                {/* 2.3. Data Landscape (Narrative) */}
                {narrative?.dataLandscape && (
                  <section className={styles.narrativeSection}>
                    <h2 className={styles.sectionTitle}>Data Landscape</h2>
                    <div className={styles.summaryText}>
                      {narrative.dataLandscape}
                    </div>
                  </section>
                )}

                {/* 3. Key Metrics Grid */}
                {narrative?.keyMetrics && (
                  <section className={styles.metricsSection}>
                    <h2 className={styles.sectionTitle}>Key Metrics</h2>
                    <div className={styles.metricsGrid}>
                      {narrative.keyMetrics.map((m: { label: string; value: string; hint?: string }) => (
                        <div key={m.label} className={styles.metricCard}>
                          <span className={styles.metricLabel}>{m.label}</span>
                          <span className={styles.metricValue}>{m.value}</span>
                          {m.hint && <span className={styles.metricHint}>{m.hint}</span>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3.0. Trends & Patterns (MVP Restoration) */}
                {narrative?.trends && narrative.trends.length > 0 && (
                  <section className={styles.narrativeSection}>
                    <h2 className={styles.sectionTitle}>Trends & Patterns</h2>
                    <div className={styles.trendsList}>
                      {narrative.trends.map((trend: { title: string; insights: string[] }, i: number) => (
                        <div key={i} className={styles.trendItem}>
                          <h3 className={styles.trendTitle}>{trend.title}</h3>
                          <ul className={styles.trendInsights}>
                            {trend.insights.map((insight: string, j: number) => (
                              <li key={j}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3.1. Data Health Assessment */}
                {healthTables.length > 0 && (
                  <section className={styles.narrativeSection}>
                    <h2 className={styles.sectionTitle}>Data Health Assessment</h2>
                    <div className={styles.healthGrid}>
                      {healthTables.map((t: any) => (
                        <div key={t.name} className={styles.healthCard}>
                          <span className={styles.healthLabel}>{t.name}</span>
                          <div className={styles.healthScoreWrap}>
                            <span className={styles.healthScoreValue}>{t.metrics?.dataHealthScore || 0}</span>
                            <span className={styles.healthScorePct}>/100</span>
                          </div>
                          <div className={styles.healthBar}>
                            <motion.div 
                              className={styles.healthProgress}
                              initial={{ width: 0 }}
                              animate={{ width: `${t.metrics?.dataHealthScore || 0}%` }}
                              style={{ 
                                background: (t.metrics?.dataHealthScore || 0) > 80 ? 'var(--color-foam)' : 
                                            (t.metrics?.dataHealthScore || 0) > 50 ? '#FB923C' : 'var(--color-urchin)' 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Strategic Actions */}
                {narrative?.recommendations && narrative.recommendations.length > 0 && (
                  <section className={styles.actionsSection}>
                    <h2 className={styles.sectionTitle}>Strategic Actions</h2>
                    <div className={styles.actionList}>
                      {narrative.recommendations.map((action: { priority: "critical" | "high" | "med"; label: string; task: string }, i: number) => (
                        <div key={i} className={`${styles.actionItem} ${styles[action.priority]}`}>
                          <div className={styles.actionHeader}>
                            <Badge variant={action.priority === "critical" ? "urchin" : "reef"}>
                              {action.priority.toUpperCase()}
                            </Badge>
                            <h3 className={styles.actionLabel}>{action.label}</h3>
                          </div>
                          <p className={styles.actionTask}>{action.task}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. Distribution Profile (Charts) */}
                <section className={styles.dataSection}>
                  <h2 className={styles.sectionTitle}>Distribution Profile</h2>
                  <DibCharts 
                    sizeDistribution={charts.sizeDistribution} 
                    rowCounts={charts.rowCounts} 
                  />
                </section>

                {/* 6. Technical Anomalies (Old Insights) */}
                <DibInsights insights={insights} />

                {/* 7. Intelligence Sampling Banner */}
                <div className={styles.samplingBanner}>
                  <Zap className={styles.samplingIcon} size={16} />
                  <p className={styles.samplingText}>
                    Intelligence generated using <strong>DataBreef Deep Sampling</strong> (5 rows per strategic table). 
                    No PII is stored; only structural patterns are analyzed by the AI engine.
                  </p>
                </div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>
    </div>
  );
}
