import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { auth } from "@/lib/auth";
import styles from "./layout.module.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userEmail = session?.user?.email;
  const userName = session?.user?.name;

  return (
    <div className={styles.shell}>
      <Sidebar userEmail={userEmail} userName={userName} />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content} role="main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
