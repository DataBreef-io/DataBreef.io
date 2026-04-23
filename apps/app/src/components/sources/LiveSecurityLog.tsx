"use client";

import React, { useState, useEffect, useRef } from "react";
import { Copy, Terminal, ChevronDown, CheckCircle2 } from "lucide-react";
import { IntrospectionLog } from "@/lib/introspection/types";
import styles from "./LiveSecurityLog.module.css";

interface LiveSecurityLogProps {
  logs: IntrospectionLog[];
  isComplete: boolean;
}

export function LiveSecurityLog({ logs, isComplete }: LiveSecurityLogProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const copyToClipboard = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] ${l.message}${l.rawSql ? ` \nSQL: ${l.rawSql}` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Terminal size={14} className={styles.titleIcon} />
          <span className={styles.title}>Security Audit Log</span>
          {isComplete && (
            <div className={styles.completeBadge}>
              <CheckCircle2 size={12} />
              <span>Verified</span>
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <button 
            className={`${styles.toggle} ${showRaw ? styles.active : ""}`}
            onClick={() => setShowRaw(!showRaw)}
          >
            Developer View
          </button>
          <button className={styles.copyBtn} onClick={copyToClipboard}>
            {copied ? "Copied!" : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Log View */}
      <div className={styles.logViewport} ref={scrollRef}>
        {logs.length === 0 ? (
          <div className={styles.empty}>Waiting for connection...</div>
        ) : (
          <div className={styles.logList}>
            {logs.map((log, i) => (
              <div key={i} className={`${styles.logItem} ${styles[log.level]}`}>
                <div className={styles.logMain}>
                  <span className={styles.timestamp}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={styles.message}>{log.message}</span>
                </div>
                {showRaw && log.rawSql && (
                  <div className={styles.rawSql}>
                    <code className={styles.code}>{log.rawSql}</code>
                  </div>
                )}
              </div>
            ))}
            {!isComplete && <div className={styles.cursor} />}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <p>DataBreef executes these commands to ensure a read-only environment.</p>
      </div>
    </div>
  );
}
