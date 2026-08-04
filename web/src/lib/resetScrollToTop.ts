import { getLenisInstance } from "@/lib/lenisInstance";

/** Reset native scroll and Lenis to the top of the page. */
export function resetScrollToTop(): void {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  getLenisInstance()?.scrollTo(0, { immediate: true, force: true });
}
