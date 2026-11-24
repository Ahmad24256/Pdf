export class AppError extends Error {
  readonly userMessage: string;

  constructor(userMessage: string, options?: { cause?: unknown }) {
    super(userMessage, options);
    this.name = 'AppError';
    this.userMessage = userMessage;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.userMessage;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. No data left your device.';
}

export function asAppError(error: unknown, fallback: string): AppError {
  if (error instanceof AppError) return error;
  return new AppError(fallback, { cause: error });
}
