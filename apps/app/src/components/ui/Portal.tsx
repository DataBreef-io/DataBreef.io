/**
 * apps/app/src/components/ui/Portal.tsx
 * Utility to render components outside the parent DOM tree (into document.body).
 * Essential for escaping overflow:hidden and stacking context constraints.
 */

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
