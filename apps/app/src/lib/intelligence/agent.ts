/**
 * apps/app/src/lib/intelligence/agent.ts
 * AI Agent for synthesizing deep database insights using Gemini.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { IntrospectionResult } from "../introspection/types";

export interface AIInsights {
  executiveSummary: string;
  dataLandscape: string;
  strategicAnomalies: Array<{
    type: "security" | "integrity" | "optimization" | "staleness";
    title: string;
    description: string;
    level: "critical" | "warning" | "info";
  }>;
  trends: Array<{
    title: string;
    insights: string[];
  }>;
  keyMetrics: Array<{
    label: string;
    value: string;
    hint?: string;
  }>;
  domainContext: string;
}

export class IntelligenceAgent {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generates a high-fidelity intelligence brief from introspection telemetry.
   */
  async synthesize(result: IntrospectionResult): Promise<AIInsights> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. Construct a dense manifest for the top 5 tables (Pruned to stay in Free Tier limits)
    const strategicTables = result.tables
      .sort((a, b) => (b.metrics?.rowCount ?? 0) - (a.metrics?.rowCount ?? 0))
      .slice(0, 5);

    const manifest = strategicTables.map(t => ({
      table: `${t.schemaName}.${t.name}`,
      rows: t.metrics?.rowCount,
      health: t.metrics?.dataHealthScore,
      relationships: t.foreignKeys.map(fk => ({
        to: fk.referencedTable,
        via: fk.columnNames.join(", ")
      })),
      columns: t.columns.map(c => ({
        name: c.name,
        type: c.type,
        nullFrac: c.fieldMetrics?.nullFrac,
        stats: {
          min: c.fieldMetrics?.min,
          max: c.fieldMetrics?.max,
          avg: c.fieldMetrics?.avg,
          nDistinct: c.fieldMetrics?.nDistinct
        },
        samples: c.fieldMetrics?.sampleValues?.slice(0, 3)
      }))
    }));

    const prompt = `
      You are DataBreef, a premium database intelligence agent.
      Analyze the following database manifest and generate a high-fidelity intelligence brief in the style of an executive strategy document.
      
      MANIFEST:
      ${JSON.stringify(manifest, null, 2)}
      
      INSTRUCTIONS:
      1. Determine the 'Domain Context' (e.g. Workforce Intelligence, E-commerce Operations).
      2. Write an 'Executive Summary' (2 detailed paragraphs). Mention specific date ranges and scale if found in stats.
      3. Describe the 'Data Landscape' - explain how tables relate in plain English (e.g. "The employee table anchors the reef, with compensation history flowing into the salary table via employee_id").
      4. Identify 'Trends & Patterns' - Look for:
         - Time-bound clusters (e.g. "Hiring starting day one in 1985").
         - Mathematical ratios (e.g. "Avg salary records per employee").
         - Distribution skews (e.g. "Salary floor vs mid-point").
      5. Identify 'Strategic Anomalies' - Look for:
         - Data Currency (Staleness).
         - Sentinel Values (e.g. '9999-01-01').
         - ID Gaps or Cardinality mismatches.
      6. Provide 3-5 'Dynamic Key Metrics' that go beyond row counts (e.g., "Avg Salary", "Latest Activity Date").
      
      OUTPUT FORMAT (JSON ONLY, NO MARKDOWN TAGS):
      {
        "executiveSummary": "...",
        "dataLandscape": "...",
        "strategicAnomalies": [
          { "type": "integrity", "title": "...", "description": "...", "level": "critical" }
        ],
        "trends": [
          { "title": "Observation Title", "insights": ["Insight 1", "Insight 2"] }
        ],
        "keyMetrics": [
          { "label": "Metric Name", "value": "Value", "hint": "Explanation" }
        ],
        "domainContext": "..."
      }
    `;

    try {
      const gResult = await model.generateContent(prompt);
      const text = gResult.response.text();
      
      // Improved JSON extraction: find the first { and last }
      const startIdx = text.indexOf("{");
      const endIdx = text.lastIndexOf("}");
      
      if (startIdx === -1 || endIdx === -1) {
        console.error("[AI RAW RESPONSE]:", text);
        throw new Error("AI failed to return valid JSON structure");
      }
      
      const jsonText = text.substring(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonText);
      return parsed as AIInsights;
    } catch (error: any) {
      console.error("IntelligenceAgent failure:", error.message || error);
      return {
        executiveSummary: `AI Synthesis failed: ${error.message || "Unknown error"}. Basic structural metrics provided.`,
        dataLandscape: "Structural relationships detected but narrative mapping offline.",
        strategicAnomalies: [],
        trends: [],
        keyMetrics: [],
        domainContext: "Unknown Ecosystem"
      };
    }
  }
}
