import { describe, it, expect, afterEach, vi } from "vitest";
import { getFrontendCorsOrigins } from "./env.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getFrontendCorsOrigins", () => {
  it("non-production: empty FRONTEND_ORIGIN falls back to Vite default", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("FRONTEND_ORIGIN", "");
    expect(getFrontendCorsOrigins()).toEqual(["http://localhost:5173"]);
  });

  it("non-production: trims and strips trailing slashes", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("FRONTEND_ORIGIN", " https://faxxiner.vercel.app/ ");
    expect(getFrontendCorsOrigins()).toEqual(["https://faxxiner.vercel.app"]);
  });

  it("non-production: supports multiple origins", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("FRONTEND_ORIGIN", "https://a.com/,https://b.com");
    expect(getFrontendCorsOrigins()).toEqual(["https://a.com", "https://b.com"]);
  });

  it("production: throws when no origin configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FRONTEND_ORIGIN", "");
    expect(() => getFrontendCorsOrigins()).toThrow(/FRONTEND_ORIGIN/);
  });

  it("production: accepts configured origin", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FRONTEND_ORIGIN", "https://faxxiner.vercel.app/");
    expect(getFrontendCorsOrigins()).toEqual(["https://faxxiner.vercel.app"]);
  });
});
