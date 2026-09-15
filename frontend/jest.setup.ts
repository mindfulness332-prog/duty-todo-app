import "@testing-library/jest-dom";

// jsdom does not implement matchMedia, but antd's responsive components
// (e.g. List, Grid breakpoints) call it on mount.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
