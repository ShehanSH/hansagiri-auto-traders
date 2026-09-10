export type NotificationEvent =
  | "inquiry"
  | "testDrive"
  | "tradeIn"
  | "contact"
  | "financing";

/**
 * Modular notification hook.
 * Store the record first, then call this. Email / WhatsApp / SMS
 * providers can be added here later without changing form code.
 */
export async function notifyNewRecord(
  event: NotificationEvent,
  entityId: string,
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info(`[notify] ${event} ${entityId}`);
  }
}
