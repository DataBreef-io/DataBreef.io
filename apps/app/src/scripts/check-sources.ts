import postgres from "postgres";

async function checkSchemaDetail() {
  const connectionString = "postgresql://neondb_owner:npg_gsVbk6IKYXe1@ep-shiny-darkness-ane7gg76-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  const sql = postgres(connectionString, { ssl: "require" });

  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'sources';
    `;
    console.log("Sources Columns:", columns.map(c => c.column_name));

  } catch (err) {
    console.error("Schema check failed:", err);
  } finally {
    await sql.end();
  }
}

checkSchemaDetail();
