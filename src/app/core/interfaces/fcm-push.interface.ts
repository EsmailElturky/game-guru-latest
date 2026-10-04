/** Normalized FCM payload (foreground MessagePayload or service-worker relay). */
export interface FcmPushPayload {
  from?: string;
  messageId?: string;
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}
