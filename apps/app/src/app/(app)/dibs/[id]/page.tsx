import { db } from "@/lib/db-client";
import { dibs } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DibPageClient } from "./DibPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const [dib] = await db
    .select()
    .from(dibs)
    .where(eq(dibs.id, id));

  if (!dib) notFound();

  return <DibPageClient initialDib={dib} />;
}
