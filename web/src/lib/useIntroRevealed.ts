import { isIntroRevealed, subscribeIntroRevealed } from "@/lib/introState";
import { useEffect, useState } from "react";

/** True once the home intro overlay has finished (or was skipped). */
export function useIntroRevealed(): boolean {
  const [revealed, setRevealed] = useState(isIntroRevealed);

  useEffect(() => subscribeIntroRevealed(() => setRevealed(true)), []);

  return revealed;
}
