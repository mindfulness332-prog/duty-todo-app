import "@testing-library/jest-dom";

// antd's heavier components (Form, List, Popconfirm) render noticeably
// slower under jsdom than plain DOM, especially combined with realistic
// userEvent interaction delays — the 5s Jest default runs flaky on a loaded
// machine. One global timeout keeps every test file consistent instead of
// scattering per-test overrides.
jest.setTimeout(20000);

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
