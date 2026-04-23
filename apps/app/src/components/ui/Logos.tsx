/**
 * apps/app/src/components/ui/Logos.tsx
 * Collection of engine-specific logos with DataBreef bioluminescent styling.
 */

import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const PostgresLogo = ({ size = 24, ...props }: LogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Stylized Elephant representation or Database icon with PG accent */}
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2-12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
      fill="currentColor"
    />
    <path
      d="M12 6V11"
      stroke="var(--color-reef)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 13V18"
      stroke="var(--color-reef)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 12H16"
      stroke="var(--color-reef)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Bioluminescent glow point */}
    <circle cx="12" cy="12" r="2" fill="var(--color-foam)" />
  </svg>
);

export const DatabaseEngineIcon = ({ type, size = 24 }: { type: string; size?: number }) => {
  switch (type.toLowerCase()) {
    case "postgres":
    case "postgresql":
      return <PostgresLogo size={size} />;
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5V19A9 3 0 0 0 21 19V5" />
          <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
      );
  }
};
