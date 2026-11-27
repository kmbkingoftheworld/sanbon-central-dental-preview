(() => {
  const root = document.documentElement;
  const primaryMouse = matchMedia("(hover: hover) and (pointer: fine)");
  function useMouse(enabled) {
    root.classList.toggle("scroll-mouse", enabled);
  }
  useMouse(primaryMouse.matches);
  primaryMouse.addEventListener("change", (event) => useMouse(event.matches));
  document.addEventListener("pointerover", (event) => useMouse(event.pointerType === "mouse"), { passive: true });
})();
