import request from "supertest";
import { createApp } from "../../../app";
import { pool } from "../../../db/pool";

const app = createApp();

beforeEach(async () => {
  await pool.query("TRUNCATE duties RESTART IDENTITY");
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/duties", () => {
  it("returns an empty list when there are no duties", async () => {
    const res = await request(app).get("/api/duties");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  it("returns previously created duties", async () => {
    await request(app).post("/api/duties").send({ name: "Buy groceries" });

    const res = await request(app).get("/api/duties");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ name: "Buy groceries" });
  });
});

describe("POST /api/duties", () => {
  it("creates a duty and returns 201 with a generated id", async () => {
    const res = await request(app).post("/api/duties").send({ name: "Buy groceries" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: "Buy groceries" });
    expect(typeof res.body.data.id).toBe("string");
  });

  it("rejects an empty name with 400", async () => {
    const res = await request(app).post("/api/duties").send({ name: "   " });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a name over 200 characters with 400", async () => {
    const res = await request(app).post("/api/duties").send({ name: "a".repeat(201) });

    expect(res.status).toBe(400);
  });

  it("rejects a request missing the name field with 400", async () => {
    const res = await request(app).post("/api/duties").send({});

    expect(res.status).toBe(400);
  });

  it("rejects a malformed JSON body with 400", async () => {
    const res = await request(app)
      .post("/api/duties")
      .set("Content-Type", "application/json")
      .send('{"name": "unterminated');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("PUT /api/duties/:id", () => {
  it("updates an existing duty", async () => {
    const created = await request(app).post("/api/duties").send({ name: "Old name" });
    const id: string = created.body.data.id;

    const res = await request(app).put(`/api/duties/${id}`).send({ name: "New name" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id, name: "New name" });
  });

  it("rejects a malformed id with 400", async () => {
    const res = await request(app).put("/api/duties/not-a-uuid").send({ name: "New name" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a well-formed id that does not exist", async () => {
    const res = await request(app)
      .put("/api/duties/00000000-0000-0000-0000-000000000000")
      .send({ name: "New name" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/duties/:id", () => {
  it("deletes an existing duty and returns 204", async () => {
    const created = await request(app).post("/api/duties").send({ name: "To delete" });
    const id: string = created.body.data.id;

    const res = await request(app).delete(`/api/duties/${id}`);
    expect(res.status).toBe(204);

    const list = await request(app).get("/api/duties");
    expect(list.body.data).toHaveLength(0);
  });

  it("returns 404 when deleting an id that does not exist", async () => {
    const res = await request(app).delete("/api/duties/00000000-0000-0000-0000-000000000000");

    expect(res.status).toBe(404);
  });

  it("rejects a malformed id with 400", async () => {
    const res = await request(app).delete("/api/duties/not-a-uuid");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("health checks", () => {
  it("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  it("GET /health/db returns 200 when the database is reachable", async () => {
    const res = await request(app).get("/health/db");
    expect(res.status).toBe(200);
  });
});
