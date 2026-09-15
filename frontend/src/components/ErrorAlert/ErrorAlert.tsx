import { Alert, Button } from "antd";

interface ErrorAlertProps {
  message: string;
  onRetry: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <Alert
      type="error"
      showIcon
      message="Something went wrong"
      description={message}
      action={
        <Button size="small" danger onClick={onRetry}>
          Retry
        </Button>
      }
    />
  );
}
