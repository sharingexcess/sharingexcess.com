/**
 * Home page intro overlay — appears on hard page load only.
 *
 * Exit sequence:
 *   1. Text drifts upward and fades out (0.5 s).
 *   2. After a short overlap, the green panel fades out (0.65 s, 0.15 s delay).
 *
 * Text is in its own fixed layer (z:20001) independent of the panel (z:20000),
 * giving a parallax feel as the text glides away before the background fades.
 *
 * Does NOT replay on Astro SPA navigation (module-level guard + component is transition:persist).
 */

import { INTRO_HOLD_S, introHasPlayed, markIntroRevealed } from "@/lib/introState";
import { motion, useReducedMotion } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";

const TEXT = "Sharing Excess";

// ── timing ──────────────────────────────────────────────────────────────────
// Text: fades + drifts up, then panel follows.
const TEXT_EXIT_S = 0.4;
const PANEL_DELAY_S = 0.15; // panel starts soon after text begins exiting
const PANEL_FADE_S = 0.65;

// Panel ease: quick fade-out, homepage appears sooner.
const PANEL_EASE: [number, number, number, number] = [0.4, 0, 1, 1];
// Text exit: smooth ease-in so it glides away.
const TEXT_EASE: [number, number, number, number] = [0.4, 0, 0.6, 1];

// ── wave ────────────────────────────────────────────────────────────────────
const WAVE_Y_PX = 38;
const WAVE_PERIOD_S = 1.5;
const WAVE_CHAR_STAGGER_S = 0.1;
const WAVE_EASE: [number, number, number, number] = [0.45, 0, 0.55, 1];

function WavyChar({ char, index }: { char: string; index: number }) {
  return (
    <motion.span
      style={{ display: "inline-block" }}
      animate={{ y: [0, -WAVE_Y_PX, 0] }}
      transition={{
        duration: WAVE_PERIOD_S,
        repeat: Infinity,
        repeatType: "loop",
        delay: index * WAVE_CHAR_STAGGER_S,
        ease: WAVE_EASE,
      }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

export function HomeIntroOverlay({ isHomePage }: { isHomePage: boolean }) {
  const reduceMotion = useReducedMotion();
  const phaseRef = useRef<"show" | "exit" | "done">("done");

  const [phase, setPhaseState] = useState<"show" | "exit" | "done">(() => {
    if (!isHomePage || introHasPlayed || reduceMotion) return "done";
    return "show";
  });

  const setPhase = (p: typeof phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  useEffect(() => {
    if (phase === "done") {
      markIntroRevealed();
      return;
    }
    if (phase !== "show") return;
    const t = window.setTimeout(() => setPhase("exit"), INTRO_HOLD_S * 1000);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "done") return null;

  const isExiting = phase === "exit";

  return (
    <>
      {/* ── Text layer ─────────────────────────────────────────────────────
          Fixed independently of the panel so it drifts at its own pace.   */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          zIndex: 20001,
          pointerEvents: "none",
          // Centre via transform; framer-motion y will be added on top of this.
          x: "-50%",
          y: "-50%",
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          y: isExiting ? "calc(-50% - 12vh)" : "-50%",
        }}
        transition={
          isExiting
            ? { duration: TEXT_EXIT_S, ease: TEXT_EASE }
            : { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
        }
      >
        <p
          className="m-0 select-none font-sans font-semibold text-white"
          style={{
            fontSize: "clamp(2.75rem, 9vw, 6.5rem)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}
          aria-label={TEXT}
        >
          {TEXT.split("").map((char, i) => (
            <WavyChar key={i} char={char} index={i} />
          ))}
        </p>
      </motion.div>

      {/* ── Panel layer ────────────────────────────────────────────────────
          Fullscreen green — fades out after text is nearly gone.            */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 20000,
          backgroundColor: "var(--color-se-green)",
        }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={
          isExiting
            ? { duration: PANEL_FADE_S, delay: PANEL_DELAY_S, ease: PANEL_EASE }
            : { duration: 0 }
        }
        onAnimationComplete={() => {
          if (phaseRef.current === "exit") setPhase("done");
        }}
      />
    </>
  );
}
