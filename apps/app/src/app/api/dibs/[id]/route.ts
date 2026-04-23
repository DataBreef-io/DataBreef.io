import { db } from "@/lib/db-client";
import { dibs } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const [dib] = await db
    .select()
    .from(dibs)
    .where(eq(dibs.id, id));

  if (!dib) {
    return NextResponse.json({ error: "Dib not found" }, { status: 404 });
  }

  return NextResponse.json(dib);
}
