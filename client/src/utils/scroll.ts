// utils/scroll.ts
export function getScrollParent(node: HTMLElement | null): HTMLElement {
  if (!node) return (document.scrollingElement as HTMLElement) || document.documentElement;
  let el: HTMLElement | null = node.parentElement;
  const overflowRegex = /(auto|scroll|overlay)/;
  while (el && el !== document.body) {
    const style = window.getComputedStyle(el);
    if (overflowRegex.test(style.overflowY) && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return (document.scrollingElement as HTMLElement) || document.documentElement;
}

/**
 * Scroll the section OUT of view (align its bottom with the top of the container/viewport).
 * headerOffset: pixels to leave for sticky header (default 0).
 */
export async function scrollSectionOutOfView(
  sectionEl: HTMLElement,
  opts?: { headerOffset?: number; }
) {
  const headerOffset = opts?.headerOffset ?? 0;
  const container = getScrollParent(sectionEl);

  // Wait two rAFs to let any layout changes settle (fixes the "needs two clicks" problem).
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);

  const sectionRect = sectionEl.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect?.() ?? { top: 0, left: 0 };

  // temporarily disable scroll snapping (if any)
  const prevSnap = container.style?.scrollSnapType ?? "";
  container.style.scrollSnapType = "none";

  if (container === document.scrollingElement || container === document.documentElement) {
    // document scrolling
    const absoluteBottom = window.scrollY + sectionRect.bottom;
    const target = Math.max(0, absoluteBottom - headerOffset);
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    // element scrolling
    const delta = sectionRect.bottom - containerRect.top - headerOffset;
    const target = Math.max(0, container.scrollTop + delta);
    container.scrollTo({ top: target, behavior: "smooth" });
  }

  // restore snap after animation (safe timeout; tweak if you have a very slow animation)
  setTimeout(() => {
    container.style.scrollSnapType = prevSnap;
  }, 700);
}
