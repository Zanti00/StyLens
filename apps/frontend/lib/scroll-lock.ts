// Singleton to manage body scroll locking across multiple modals
let lockCount = 0;

export const lockScroll = () => {
  lockCount++;
  if (typeof document !== "undefined") {
    document.body.style.overflow = "hidden";
  }
};

export const unlockScroll = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (typeof document !== "undefined" && lockCount === 0) {
    document.body.style.overflow = "unset";
  }
};
