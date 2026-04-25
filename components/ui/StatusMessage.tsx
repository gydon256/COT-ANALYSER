type StatusMessageProps = {
  error?: string | string[];
  message?: string | string[];
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function StatusMessage({ error, message }: StatusMessageProps) {
  const errorText = firstValue(error);
  const messageText = firstValue(message);

  if (!errorText && !messageText) {
    return null;
  }

  if (errorText) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {errorText}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
      {messageText}
    </div>
  );
}
