import { describe, expect, it } from "vitest";
import { renderNotification } from "./notifications";

describe("renderNotification", () => {
  it("routes new leads to the internal recipient", () => {
    const email = renderNotification({ id: "1", recipient_email: null, audience: "internal", template: "lead_created", attempts: 1, payload: { company: "Northstar", name: "Maya", email: "maya@example.test", source: "contact", lead_id: "lead-1" } }, "ops@qgritai.com");
    expect(email.to).toBe("ops@qgritai.com");
    expect(email.subject).toContain("Northstar");
  });

  it("routes proposal notices to the lead", () => {
    const email = renderNotification({ id: "2", recipient_email: "client@example.test", audience: "client", template: "proposal_sent", attempts: 1, payload: { title: "AI discovery", proposal_id: "proposal-1" } }, "ops@qgritai.com");
    expect(email.to).toBe("client@example.test");
  });
});
