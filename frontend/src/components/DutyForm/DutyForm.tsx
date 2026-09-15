import { useState } from "react";
import { Button, Form, Input } from "antd";
import { ApiError } from "../../services/ApiError";

interface DutyFormValues {
  name: string;
}

interface DutyFormProps {
  initialName?: string;
  submitLabel: string;
  onSubmit: (name: string) => Promise<void>;
  onSuccess?: () => void;
}

const MAX_NAME_LENGTH = 200;

export function DutyForm({ initialName, submitLabel, onSubmit, onSuccess }: DutyFormProps) {
  const [form] = Form.useForm<DutyFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleFinish(values: DutyFormValues): Promise<void> {
    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit(values.name.trim());
      form.setFieldsValue({ name: "" });
      onSuccess?.();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleFinish}
      onValuesChange={() => setServerError(null)}
      initialValues={{ name: initialName ?? "" }}
    >
      <Form.Item
        name="name"
        style={{ flex: 1 }}
        {...(serverError ? { validateStatus: "error" as const, help: serverError } : {})}
        rules={[
          { required: true, whitespace: true, message: "Name is required" },
          { max: MAX_NAME_LENGTH, message: `Name must be at most ${MAX_NAME_LENGTH} characters` },
        ]}
      >
        <Input placeholder="What needs to be done?" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </Form.Item>
    </Form>
  );
}
