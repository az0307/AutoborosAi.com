import { env } from "./env";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Sends an email via the Resend REST API.
 *
 * Calls Resend directly with `fetch` (no `resend` SDK dependency), matching
 * the pattern already used in the sibling ymiroofing.com.au repo's
 * `functions/api/lead.js`.
 *
 * Email is optional infrastructure, not a hard dependency: if RESEND_API_KEY
 * isn't configured, or the Resend API call fails, this logs and resolves
 * rather than throwing — a broken/unconfigured mailer should never break the
 * caller's flow.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<void> {
  if (!env.resendApiKey) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping email send ("${subject}")`,
    );
    return;
  }

  if (!html && !text) {
    throw new Error("sendEmail requires either `html` or `text` content");
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.emailFrom,
        to,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`[email] Resend API error (${resp.status}): ${errorText}`);
    }
  } catch (error) {
    console.error("[email] Failed to send email:", error);
  }
}
