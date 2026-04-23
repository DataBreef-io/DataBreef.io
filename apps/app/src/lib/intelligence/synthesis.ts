import { IntrospectionResult } from "../introspection/types";
import { IntelligenceAgent, AIInsights } from "./agent";

export interface NarrativeBrief {
  executiveSummary: string;
  schemaSummary?: string; 
  ecosystems?: Array<{ name: string; tableCount: number; rowCount: number }>;
  keyMetrics: Array<{ label: string; value: string; hint?: string }>;
  trends: Array<{ title: string; insights: string[] }>;
  recommendations: Array<{ priority: "critical" | "high" | "med"; label: string; task: string }>;
  strategicAnomalies?: AIInsights["strategicAnomalies"];
  domainContext?: string;
}

export async function synthesizeNarrative(result: IntrospectionResult): Promise<NarrativeBrief> {
  const topTables = result.tables
    .sort((a, b) => (b.metrics?.rowCount ?? 0) - (a.metrics?.rowCount ?? 0))
    .slice(0, 5);

  const totalRows = result.tables.reduce((acc, t) => acc + (t.metrics?.rowCount ?? 0), 0);
  
  // 0. AI Intelligence Pass (If API key exists)
  let aiInsights: AIInsights | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    const agent = new IntelligenceAgent(apiKey);
    aiInsights = await agent.synthesize(result);
  }

  // 0. Schema Analysis
  const schemas = Array.from(new Set(result.tables.map(t => t.schemaName)));
  const ecosystems = schemas.map(s => {
    const sTables = result.tables.filter(t => t.schemaName === s);
    return {
      name: s,
      tableCount: sTables.length,
      rowCount: sTables.reduce((acc, t) => acc + (t.metrics?.rowCount ?? 0), 0)
    };
  });

  const crossSchemaLinks = result.tables.flatMap(t => 
    t.foreignKeys.filter(fk => fk.referencedTable.includes(".") && !fk.referencedTable.startsWith(t.schemaName + "."))
  ).length;

  // 1. Executive Summary
  const executiveSummary = aiInsights?.executiveSummary || `
    This data reef spans ${schemas.length} namespaces tracking approximately ${totalRows.toLocaleString()} total records. 
    The landscape is dominated by ${topTables[0]?.name || "a central repository"}, which holds ${topTables[0]?.metrics?.rowCount?.toLocaleString() || 0} entries.
    ${result.stats.relationCount > result.stats.tableCount ? "The schema is highly relational and well-normalized." : "The schema is sparse, suggesting a flatter structure."}
  `.trim();

  const dataLandscape = aiInsights?.dataLandscape || `
    This ecosystem is composed of ${result.stats.tableCount} tables linked by ${result.stats.relationCount} cross-table relationships.
    The primary tables are ${topTables.map(t => t.name).join(", ")}.
  `.trim();

  const schemaSummary = schemas.length > 1 ? `
    Intelligence detected ${schemas.length} distinct ecosystems. 
    ${ecosystems.map(e => `${e.name} (${e.tableCount} tables, ${e.rowCount.toLocaleString()} rows)`).join(", ")}. 
    ${crossSchemaLinks > 0 ? `Identified ${crossSchemaLinks} cross-schema structural links.` : "Ecosystems are largely isolated."}
  `.trim() : undefined;

  // 2. Key Metrics (Merge AI and deterministic)
  const keyMetrics = [
    ...(aiInsights?.keyMetrics || []),
    { label: "Total Entities", value: totalRows.toLocaleString(), hint: "Full scale of the reef" },
    { label: "Active Ecosystems", value: schemas.length.toString(), hint: "Detected namespaces" },
  ];

  // 3. Trends (Merged with AI context)
  const trends = [
    ...(aiInsights?.trends || []),
    { 
      title: "Structural Patterns", 
      insights: [
        `Central repository anchored in ${topTables[0]?.schemaName}.${topTables[0]?.name}`,
        `${result.stats.relationCount} relationships mapped across ${schemas.length} schemas.`
      ] 
    }
  ];

  // 4. Strategic Actions
  const recommendations: NarrativeBrief["recommendations"] = [];
  
  // ... (existing recommendation logic)
  const orphans = result.tables.filter(t => t.foreignKeys.length === 0);
  if (orphans.length > 0) {
    recommendations.push({
      priority: "high",
      label: "Audit Schema Connectivity",
      task: `Review ${orphans.length} orphaned tables across ${schemas.length} schemas.`
    });
  }

  const anchorless = result.tables.filter(t => !t.metrics?.hasPrimaryKey);
  if (anchorless.length > 0) {
    recommendations.push({
      priority: "critical",
      label: "Enforce Structural Anchors",
      task: `Define Primary Keys for ${anchorless.length} tables to prevent data drift.`
    });
  }

  return { 
    executiveSummary, 
    dataLandscape,
    schemaSummary, 
    ecosystems, 
    keyMetrics, 
    trends, 
    recommendations,
    strategicAnomalies: aiInsights?.strategicAnomalies,
    domainContext: aiInsights?.domainContext
  };
}
