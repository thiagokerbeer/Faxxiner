import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("createApp", () => {
  const app = createApp();

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

  it("rejects malformed JSON with 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ not-json");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });
});
