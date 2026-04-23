import React from "react";
import { Database, ChevronRight } from "lucide-react";
import styles from "./EngineSelector.module.css";
import { DatabaseEngineType } from "@/lib/introspection/types";

interface EngineOption {
  id: DatabaseEngineType;
  name: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const ENGINES: EngineOption[] = [
  { id: "postgres", name: "PostgreSQL", icon: <Database size={20} /> },
  { id: "mysql", name: "MySQL / MariaDB", icon: <Database size={20} /> },
  { id: "mssql", name: "SQL Server", icon: <Database size={20} />, comingSoon: true },
  { id: "oracle", name: "Oracle", icon: <Database size={20} />, comingSoon: true },
  { id: "snowflake", name: "Snowflake", icon: <Database size={20} />, comingSoon: true },
];

interface EngineSelectorProps {
  selected: DatabaseEngineType;
  onSelect: (type: DatabaseEngineType) => void;
}

export function EngineSelector({ selected, onSelect }: EngineSelectorProps) {
  return (
    <div className={styles.grid}>
      {ENGINES.map((engine) => (
        <button
          key={engine.id}
          type="button"
          disabled={engine.comingSoon}
          className={`${styles.card} ${selected === engine.id ? styles.selected : ""} ${
            engine.comingSoon ? styles.disabled : ""
          }`}
          onClick={() => onSelect(engine.id)}
        >
          <div className={styles.iconWrap}>{engine.icon}</div>
          <div className={styles.meta}>
            <span className={styles.name}>{engine.name}</span>
            {engine.comingSoon && <span className={styles.badge}>Soon</span>}
          </div>
          <ChevronRight size={14} className={styles.arrow} />
        </button>
      ))}
    </div>
  );
}
