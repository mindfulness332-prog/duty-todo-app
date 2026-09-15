import { Empty, List } from "antd";
import type { Duty } from "../../types/duty";

interface DutyListProps {
  duties: Duty[];
  loading: boolean;
}

export function DutyList({ duties, loading }: DutyListProps) {
  return (
    <List
      loading={loading}
      dataSource={duties}
      locale={{ emptyText: <Empty description="No duties yet. Add one to get started." /> }}
      renderItem={(duty) => <List.Item key={duty.id}>{duty.name}</List.Item>}
    />
  );
}
