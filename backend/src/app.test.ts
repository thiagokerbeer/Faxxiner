import { describe, it, expect, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("createApp", () => {
  const app = createApp();

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("HEAD /health returns 200", async () => {
    await request(app).head("/health").expect(200);
  });

  it("GET /health?deep=1 checks database when reachable", async () => {
    const res = await request(app).get("/health?deep=1");
    expect([200, 503, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toMatchObject({ ok: true, db: true });
    }
  });

  it("GET /health?deep=1 is forbidden in production without secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FRONTEND_ORIGIN", "https://example.test");
    vi.stubEnv("HEALTH_DEEP_SECRET", "");
    const prodApp = createApp();
    const res = await request(prodApp).get("/health?deep=1");
    expect(res.status).toBe(403);
  });

  it("GET /health?deep=1 works in production with matching secret header", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FRONTEND_ORIGIN", "https://example.test");
    vi.stubEnv("HEALTH_DEEP_SECRET", "test-health-deep-secret-key");
    const prodApp = createApp();
    const res = await request(prodApp)
      .get("/health?deep=1")
      .set("x-health-deep-key", "test-health-deep-secret-key");
    expect([200, 503, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toMatchObject({ ok: true, db: true });
    }
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ not-json");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });
});
