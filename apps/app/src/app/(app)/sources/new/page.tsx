import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db-client";
import { users } from "@/lib/tables/schema";
import { eq } from "drizzle-orm";
import { AnchorSourceForm } from "@/components/sources/AnchorSourceForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Anchor a Reef — DataBreef",
  description: "Connect your database and surface deep schema insights.",
};

export default async function NewSourcePage() {
  const session = await auth();
  const userId = session?.user?.id;

  let isVerified = false;
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { emailVerified: true },
    });
    isVerified = !!user?.emailVerified;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Anchor a new reef</h1>
        <p className={styles.subtitle}>
          Connect your database using a secure read-only string.
          DataBreef will introspect your schema without ever touching your rows.
        </p>
      </header>

      {isVerified ? (
        <AnchorSourceForm />
      ) : (
        <div className={styles.verifyGate}>
          <p className={styles.verifyGateTitle}>Email verification required</p>
          <p className={styles.verifyGateText}>
            Please verify your email address before connecting data sources.
          </p>
          <Link href="/auth/verify-email" className={styles.verifyGateLink}>
            Verify your email →
          </Link>
        </div>
      )}
    </div>
  );
}
