import postgres from "postgres";

async function checkSchemaDeep() {
  const connectionString = "postgresql://neondb_owner:npg_gsVbk6IKYXe1@ep-shiny-darkness-ane7gg76-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  const sql = postgres(connectionString, { ssl: "require" });

  try {
    const columns = await sql`
      SELECT column_name, data_type, udt_name, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'sources';
    `;
    console.log("Sources Column Types:", columns);

    const checkConstraints = await sql`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE n.nspname = 'public' AND conrelid = 'sources'::regclass;
    `;
    console.log("Constraints:", checkConstraints);

  } catch (err) {
    console.error("Schema check failed:", err);
  } finally {
    await sql.end();
  }
}

checkSchemaDeep();
