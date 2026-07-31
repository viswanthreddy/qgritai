type Notification = { id: string; recipient_email: string | null; audience: "internal" | "client"; template: "lead_created" | "proposal_sent"; payload: Record<string, unknown>; attempts: number };

export function renderNotification(notification: Notification, internalRecipient: string) {
  const text = (key: string) => String(notification.payload[key] ?? "");
  if (notification.template === "lead_created") {
    return { to: internalRecipient, subject: `New QgritAI lead: ${text("company")}`, text: `A new ${text("source")} lead was captured.\n\nName: ${text("name")}\nCompany: ${text("company")}\nEmail: ${text("email")}\nLead ID: ${text("lead_id")}` };
  }
  if (!notification.recipient_email) throw new Error("Client notification is missing a recipient.");
  return { to: notification.recipient_email, subject: `QgritAI proposal: ${text("title")}`, text: `A proposal titled “${text("title")}” has been prepared for your review. Please reply to your QgritAI contact with any questions.\n\nProposal reference: ${text("proposal_id")}` };
}

export type { Notification };
