import { useState } from "react";
import { Button, List, Popconfirm, message } from "antd";
import { DutyForm } from "../DutyForm/DutyForm";
import { ApiError } from "../../services/ApiError";
import type { Duty } from "../../types/duty";

interface DutyItemProps {
  duty: Duty;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DutyItem({ duty, onUpdate, onDelete }: DutyItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      await onDelete(duty.id);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <List.Item>
        <div style={{ display: "flex", gap: 8, width: "100%", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <DutyForm
              initialName={duty.name}
              submitLabel="Save"
              onSubmit={(name) => onUpdate(duty.id, name)}
              onSuccess={() => setEditing(false)}
            />
          </div>
          <Button onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </List.Item>
    );
  }

  return (
    <List.Item
      actions={[
        <Button key="edit" type="link" onClick={() => setEditing(true)}>
          Edit
        </Button>,
        <Popconfirm
          key="delete"
          title="Delete this duty?"
          onConfirm={handleDelete}
          okText="Yes, delete"
          cancelText="Cancel"
        >
          <Button type="link" danger loading={deleting}>
            Delete
          </Button>
        </Popconfirm>,
      ]}
    >
      {duty.name}
    </List.Item>
  );
}
