// Isolated in its own module so it can be mocked in Jest — `import.meta.env`
// is Vite-specific syntax that Jest's Babel/ts-jest transform does not understand.
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",
};
