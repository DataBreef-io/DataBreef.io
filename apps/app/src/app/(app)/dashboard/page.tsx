import type { Metadata } from "next";
import Link from "next/link";
import { Database, ScrollText, Clock, Plus, Waves, CheckCircle, MailWarning } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DibTooltip } from "@/components/ui/DibTooltip";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db-client";
import { sources, dibs, users } from "@/lib/tables/schema";
import { eq, and, count, max } from "drizzle-orm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Reef Overview",
};

function StatCard({
  eyebrow,
  value,
  hint,
  icon,
}: {
  eyebrow: React.ReactNode;
  value: string;
  hint: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Card className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statEyebrow}>{eyebrow}</span>
        <div className={styles.statIcon} aria-hidden="true">
          {icon}
        </div>
      </div>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statHint}>{hint}</p>
    </Card>
  );
}

function EmptyState({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  cta?: { label: string; href: string };
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyWaves} aria-hidden="true">
        <svg
          viewBox="0 0 600 80"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.waveSvg}
          preserveAspectRatio="none"
        >
          <path
            className={styles.wave1}
            d="M0,40 C100,10 200,70 300,40 C400,10 500,70 600,40 L600,80 L0,80 Z"
          />
          <path
            className={styles.wave2}
            d="M0,50 C120,20 240,80 360,50 C480,20 540,65 600,50 L600,80 L0,80 Z"
          />
          <path
            className={styles.wave3}
            d="M0,60 C80,35 160,75 280,55 C400,35 500,70 600,55 L600,80 L0,80 Z"
          />
        </svg>
      </div>
      <div className={styles.emptyContent}>
        <Waves size={32} className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyEyebrow}>{eyebrow}</p>
        <h2 className={styles.emptyTitle}>{title}</h2>
        <p className={styles.emptyDescription}>{description}</p>
        {cta && (
          <Button href={cta.href} size="md" id={`empty-cta-anchor`}>
            <Plus size={14} aria-hidden="true" />
            {cta.label}
          </Button>
        )}
      </div>
    </div>
  );
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 30) return date.toLocaleDateString();
  if (days > 1) return `${days} days ago`;
  if (days === 1) return "Yesterday";
  if (hours > 1) return `${hours} hours ago`;
  if (hours === 1) return "1 hour ago";
  if (minutes > 1) return `${minutes} minutes ago`;
  if (minutes === 1) return "1 minute ago";
  return "Just now";
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return <div>Not authenticated</div>;
  }

  const userId = session.user.id;
  const userEmail = session.user.email ?? userId;

  const activeSource = and(eq(sources.userId, userId), eq(sources.isArchived, false));
  const activeDib = and(eq(dibs.userId, userId), eq(dibs.isArchived, false));

  const [userRecord, [sourcesRes], [dibsRes], [lastDiveRes]] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { emailVerified: true },
    }),
    db.select({ val: count() }).from(sources).where(activeSource),
    db.select({ val: count() }).from(dibs).where(activeDib),
    db.select({ lastAt: max(dibs.createdAt) }).from(dibs).where(activeDib),
  ]);

  const isVerified = !!userRecord?.emailVerified;

  const stats = {
    sourcesCount: Number(sourcesRes.val),
    dibsCount: Number(dibsRes.val),
    lastDive: lastDiveRes.lastAt ? relativeTime(lastDiveRes.lastAt) : null,
  };

  const hasData = stats.sourcesCount > 0;

  return (
    <div className={styles.page}>
      {/* Email verification banner */}
      {!isVerified && (
        <div className={styles.verifyBanner}>
          <MailWarning size={16} className={styles.verifyBannerIcon} aria-hidden="true" />
          <p className={styles.verifyBannerText}>
            Verify your email to unlock all features.{" "}
            <Link href="/auth/verify-email" className={styles.verifyBannerLink}>
              Resend verification email
            </Link>
          </p>
        </div>
      )}

      {/* Greeting */}
      <div className={styles.greeting}>
        <p className={styles.greetingText}>
          Welcome, {userEmail}
          {isVerified && (
            <span className={styles.verifiedBadge} title="Email verified">
              <CheckCircle size={13} aria-hidden="true" />
              Verified
            </span>
          )}
        </p>
      </div>

      {/* Stat cards */}
      <section className={styles.statsGrid} aria-label="Reef statistics">
        <StatCard
          eyebrow="Connected Reefs"
          value={String(stats.sourcesCount)}
          hint={stats.sourcesCount === 0 ? "No sources anchored yet" : "Active data sources"}
          icon={<Database size={18} />}
        />
        <StatCard
          eyebrow={<>
            <DibTooltip noUnderline>Dibs</DibTooltip> Surfaced
          </>}
          value={String(stats.dibsCount)}
          hint={stats.dibsCount === 0 ? "No briefs generated yet" : "Intelligence briefs"}
          icon={<ScrollText size={18} />}
        />
        <StatCard
          eyebrow="Last Dive"
          value={stats.lastDive ?? "—"}
          hint="Last time a brief was generated"
          icon={<Clock size={18} />}
        />
      </section>

      {/* Main content */}
      {hasData ? (
        <div className={styles.grid}>
          <Card className={styles.quickActions}>
            <h2 className={styles.sectionTitle}>Ready for another dive?</h2>
            <p className={styles.sectionDescription}>Your {stats.sourcesCount} reefs are ready for introspection.</p>
            <div className={styles.actionButtons}>
              <Button href="/sources" variant="secondary">Go to Sources</Button>
              <Button href="/dibs" variant="reef">View All Dibs</Button>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          eyebrow="Still Waters"
          title="Anchor your first reef"
          description="Connect a PostgreSQL database to start surfacing intelligence. DataBreef reads your schema — it never writes."
          cta={{ label: "Anchor a source", href: "/sources/new" }}
        />
      )}
    </div>
  );
}
