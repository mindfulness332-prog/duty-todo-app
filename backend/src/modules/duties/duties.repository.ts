import { pool } from "../../db/pool";
import type { CreateDutyInput, DutyRow, UpdateDutyInput } from "./duties.types";

export async function findAll(): Promise<DutyRow[]> {
  const result = await pool.query<DutyRow>("SELECT * FROM duties ORDER BY created_at ASC");
  return result.rows;
}

export async function create(input: CreateDutyInput): Promise<DutyRow> {
  const result = await pool.query<DutyRow>(
    "INSERT INTO duties (name) VALUES ($1) RETURNING *",
    [input.name],
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error("INSERT ... RETURNING * unexpectedly returned no row");
  }
  return row;
}

export async function update(id: string, input: UpdateDutyInput): Promise<DutyRow | undefined> {
  const result = await pool.query<DutyRow>(
    "UPDATE duties SET name = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [input.name, id],
  );
  return result.rows[0];
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM duties WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
