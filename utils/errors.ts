export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code = "app_error") {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export function toUserMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof AppError) return error.message;

  if (typeof error === "object" && error && "code" in error) {
    const code = String((error as { code: string }).code);
    if (code === "permission-denied") {
      return "You do not have permission to complete this action.";
    }
    if (code === "not-found") {
      return "This record could not be updated. Refresh the page and try again.";
    }
    if (code === "unavailable" || code === "network-request-failed") {
      return "We could not reach the server. Please check your connection and try again.";
    }
    if (code === "auth/unauthorized-domain") {
      return "This website domain is not authorised in Firebase Authentication.";
    }
    if (code === "auth/operation-not-allowed") {
      return "Email and password sign-in is not enabled in Firebase Authentication.";
    }
    if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
      return "Invalid email or password.";
    }
    if (code === "auth/user-not-found") {
      return "No account found for this email.";
    }
    if (code === "auth/too-many-requests") {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
      return "This reset link is invalid or has expired. Request a new one.";
    }
    if (code === "auth/weak-password") {
      return "Choose a stronger password with at least 8 characters.";
    }
    if (code === "auth/email-already-in-use") {
      return "This email is already in use.";
    }
    if (code === "storage/unauthorized") {
      return "Upload was not authorised. Please sign in and try again.";
    }
  }

  return fallback;
}
