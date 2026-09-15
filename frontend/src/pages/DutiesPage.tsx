import { Typography } from "antd";
import { useDuties } from "../hooks/useDuties";
import { DutyForm } from "../components/DutyForm/DutyForm";
import { DutyList } from "../components/DutyList/DutyList";
import { ErrorAlert } from "../components/ErrorAlert/ErrorAlert";

export function DutiesPage() {
  const { duties, loading, error, fetchDuties, createDuty, updateDuty, removeDuty } = useDuties();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24, background: "#fff", minHeight: "100vh" }}>
      <Typography.Title level={2}>Duty To-Do List</Typography.Title>

      {error ? (
        <ErrorAlert message={error} onRetry={fetchDuties} />
      ) : (
        <>
          <DutyForm
            submitLabel="Add"
            onSubmit={async (name) => {
              await createDuty(name);
            }}
          />
          <DutyList
            duties={duties}
            loading={loading}
            onUpdate={async (id, name) => {
              await updateDuty(id, name);
            }}
            onDelete={removeDuty}
          />
        </>
      )}
    </div>
  );
}
