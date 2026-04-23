/**
 * Client-safe password utilities (no Node.js modules).
 * These can be imported in browser components.
 */

import zxcvbn from "zxcvbn";

/**
 * Score password strength with zxcvbn (0-4).
 * Safe for client-side use.
 */
export function scorePassword(plaintext: string) {
  const result = zxcvbn(plaintext);
  return {
    score: result.score,
    feedback: result.feedback,
    crackTime: result.crack_times_display.online_throttling_100_per_10_seconds,
  };
}
