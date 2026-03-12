export const revealViewport = {
  once: true,
  amount: 0.18,
};

export const revealUp = {
  opacity: 0,
  y: 14,
};

export const revealUpLarge = {
  opacity: 0,
  y: 18,
};

export const revealVisible = {
  opacity: 1,
  y: 0,
};

export const revealTransition = (delay = 0) => ({
  duration: 0.34,
  delay,
  ease: [0.22, 1, 0.36, 1] as const,
});
