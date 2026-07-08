import { getLenisInstance } from "@/lib/lenisInstance";
import {
  getMainSections,
  getSectionAlignmentDistance,
  isRoundImageSection,
  isSectionAligned,
  ROUND_IMAGE_SECTION_SELECTOR,
} from "@/lib/roundSectionScroll";
import Snap from "lenis/snap";
import type Lenis from "lenis";

const LOCK_DRIFT_THRESHOLD = 14;
const LOCK_SCROLL_DURATION = 0.85;

let snap: Snap | null = null;
let lenisRef: Lenis | null = null;
let removeSnapElements: (() => void) | null = null;
let lockedSection: HTMLElement | null = null;
let lockEnabled = false;
let syncFrame = 0;
let observer: MutationObserver | null = null;

function canUseScrollLock(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches === false;
}

function canUseFinePointerLock(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

function syncSnapPoints() {
  if (!snap) return;

  removeSnapElements?.();
  removeSnapElements = null;

  const sections = getMainSections();
  if (sections.length > 0) {
    removeSnapElements = snap.addElements(sections, { align: "start" });
  }

  snap.resize();
}

function scheduleSyncSnapPoints() {
  cancelAnimationFrame(syncFrame);
  syncFrame = requestAnimationFrame(syncSnapPoints);
}

function activeAlignedRoundSection(): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>(ROUND_IMAGE_SECTION_SELECTOR)).find(
      (section) => isSectionAligned(section),
    ) ?? null
  );
}

function updateLockState() {
  if (!snap || !lenisRef || !lockEnabled || !canUseFinePointerLock()) {
    snap?.stop();
    return;
  }

  const alignedRound = activeAlignedRoundSection();

  if (alignedRound && lockedSection === alignedRound) {
    snap.start();

    const drift = getSectionAlignmentDistance(alignedRound);
    if (drift > LOCK_DRIFT_THRESHOLD) {
      lenisRef.scrollTo(alignedRound, {
        lerp: 0.12,
        force: true,
        userData: { initiator: "round-section-lock" },
      });
    }
    return;
  }

  snap.stop();

  if (lockedSection && !alignedRound) {
    lockedSection = null;
  }
}

function onScroll() {
  updateLockState();
}

export function initRoundSectionScrollLock(lenis: Lenis) {
  if (!canUseScrollLock()) return;

  destroyRoundSectionScrollLock();

  lenisRef = lenis;
  snap = new Snap(lenis, {
    type: "lock",
    debounce: 0,
    duration: LOCK_SCROLL_DURATION,
  });

  syncSnapPoints();
  snap.stop();

  lenis.on("scroll", onScroll);

  const main = document.querySelector("main");
  observer = new MutationObserver(scheduleSyncSnapPoints);
  if (main) {
    observer.observe(main, { childList: true, subtree: true });
  }

  window.addEventListener("resize", scheduleSyncSnapPoints);
}

export function destroyRoundSectionScrollLock() {
  cancelAnimationFrame(syncFrame);
  lenisRef?.off("scroll", onScroll);
  window.removeEventListener("resize", scheduleSyncSnapPoints);
  observer?.disconnect();
  observer = null;

  removeSnapElements?.();
  removeSnapElements = null;

  snap?.destroy();
  snap = null;
  lenisRef = null;
  lockedSection = null;
  lockEnabled = false;
}

/** Engage section-by-section wheel lock while this round section is aligned. */
export function enableRoundSectionScrollLock(section: HTMLElement) {
  if (!canUseScrollLock() || !isRoundImageSection(section)) return;

  lockEnabled = true;
  lockedSection = section;

  if (!snap && getLenisInstance()) {
    initRoundSectionScrollLock(getLenisInstance()!);
  }

  updateLockState();
}

export function disableRoundSectionScrollLock(section?: HTMLElement) {
  if (section && lockedSection !== section) return;

  lockEnabled = false;
  lockedSection = null;
  snap?.stop();
}

export function refreshRoundSectionScrollLock() {
  scheduleSyncSnapPoints();
  updateLockState();
}
