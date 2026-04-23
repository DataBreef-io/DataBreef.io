"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import styles from "./DibCharts.module.css";

interface DibChartsProps {
  sizeDistribution: Array<{ name: string; value: number }>;
  rowCounts: Array<{ name: string; count: number }>;
}

const COLORS = ["#2DD4BF", "#14B8A6", "#0D9488", "#065F46", "#34D399"];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function DibCharts({ sizeDistribution, rowCounts }: DibChartsProps) {
  return (
    <div className={styles.container}>
      {/* Table size distribution */}
      <div className={styles.chartWrap}>
        <h3 className={styles.chartTitle}>Reef Density (Storage)</h3>
        <div className={styles.chartInner}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sizeDistribution}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {sizeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatBytes(value)}
                contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", color: "#F0FDFA" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row count distribution */}
      <div className={styles.chartWrap}>
        <h3 className={styles.chartTitle}>Current Flow (Row counts)</h3>
        <div className={styles.chartInner}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={rowCounts} 
              layout="vertical" 
              margin={{ left: 40, right: 40 }}
            >
              <XAxis type="number" hide domain={[0, 'auto']} />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: "rgba(45, 212, 191, 0.1)" }}
                contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", color: "#F0FDFA" }}
              />
              <Bar 
                dataKey="count" 
                fill="#2DD4BF" 
                radius={[0, 4, 4, 0]} 
                minPointSize={4} // Ensures even 0-count tables show a tiny bar
                animationBegin={200}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
