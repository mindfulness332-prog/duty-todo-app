import { Empty, List } from "antd";
import { DutyItem } from "../DutyItem/DutyItem";
import type { Duty } from "../../types/duty";

interface DutyListProps {
  duties: Duty[];
  loading: boolean;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DutyList({ duties, loading, onUpdate, onDelete }: DutyListProps) {
  return (
    <List
      loading={loading}
      dataSource={duties}
      locale={{ emptyText: <Empty description="No duties yet. Add one to get started." /> }}
      renderItem={(duty) => (
        <DutyItem key={duty.id} duty={duty} onUpdate={onUpdate} onDelete={onDelete} />
      )}
    />
  );
}
