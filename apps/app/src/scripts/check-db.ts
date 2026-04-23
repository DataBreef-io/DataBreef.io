import postgres from "postgres";

async function checkSchema() {
  const connectionString = "postgresql://neondb_owner:npg_gsVbk6IKYXe1@ep-shiny-darkness-ane7gg76-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  const sql = postgres(connectionString, { ssl: "require" });

  try {
    console.log("Checking tables...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log("Tables:", tables);

    const columns = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name IN ('sources', 'dibs', 'source_audit_logs');
    `;
    console.log("Columns:", columns);

  } catch (err) {
    console.error("Schema check failed:", err);
  } finally {
    await sql.end();
  }
}

checkSchema();
