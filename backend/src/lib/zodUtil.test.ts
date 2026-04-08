import { describe, it, expect } from "vitest";
import { z } from "zod";
import { parseBody } from "./zodUtil.js";

describe("parseBody", () => {
  const schema = z.object({ email: z.string().email() });

  it("returns data on success", () => {
    const r = parseBody(schema, { email: "a@b.co" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.email).toBe("a@b.co");
  });

  it("returns message on failure", () => {
    const r = parseBody(schema, { email: "nope" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message.length).toBeGreaterThan(0);
  });
});
