"use client";

import { useEffect, useState } from "react";
import { DibDetails } from "@/components/dibs/DibDetails";
import { useRouter } from "next/navigation";

interface DibPageClientProps {
  initialDib: any;
}

export function DibPageClient({ initialDib }: DibPageClientProps) {
  const [dib, setDib] = useState(initialDib);
  const router = useRouter();

  useEffect(() => {
    if (dib.status !== "pending") return;

    // Check every 2 seconds if status has changed
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/dibs/${dib.id}`);
        if (!res.ok) return;
        
        const data = await res.json();
        if (data.status !== "pending") {
          setDib(data);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [dib.id, dib.status]);

  return <DibDetails dib={dib} />;
}
