import { PAGE_LAST_SECTION_CLASS, PAGE_LAST_SECTION_SELECTOR } from "@/lib/footerOverlap";

/** Mark the last block in `<main>` so footer-bridge styles apply (see global.css). */
export function markPageLastSection() {
  const main = document.querySelector("main");
  if (!main) return;

  main.querySelectorAll(`.${PAGE_LAST_SECTION_CLASS}`).forEach((el) => {
    el.classList.remove(PAGE_LAST_SECTION_CLASS);
  });

  const sections = main.querySelectorAll(PAGE_LAST_SECTION_SELECTOR);
  sections[sections.length - 1]?.classList.add(PAGE_LAST_SECTION_CLASS);
}
