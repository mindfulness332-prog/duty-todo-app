export interface Duty {
  id: string;
  name: string;
}

export interface DutyRow {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDutyInput {
  name: string;
}

export interface UpdateDutyInput {
  name: string;
}

export function toDuty(row: DutyRow): Duty {
  return { id: row.id, name: row.name };
}
