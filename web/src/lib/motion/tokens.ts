export const motion = {
  duration: { reveal: 0.8, count: 1.6 },
  ease: { reveal: "power3.out", count: "power2.out" },
  offset: { y: 40 },
  stagger: 0.12,
  start: "top 75%",
} as const;
