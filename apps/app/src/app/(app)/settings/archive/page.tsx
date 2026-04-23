import { Card } from "@/components/ui/Card";

export default function SettingsArchivePage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "var(--space-8)" }}>
      <h1 style={{ 
        fontFamily: "var(--font-heading)", 
        fontSize: "var(--text-3xl)", 
        color: "var(--text-primary)",
        marginBottom: "var(--space-6)" 
      }}>
        Archived Ecosystems
      </h1>
      
      <Card style={{ padding: "var(--space-12)", textAlign: "center", borderStyle: "dashed" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-lg)" }}>
          Archived Reefs & Briefs Management (Coming Soon)
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: "var(--space-2)" }}>
          This page will eventually house the interface for permanently deleting or restoring hidden items.
        </p>
      </Card>
    </div>
  );
}
