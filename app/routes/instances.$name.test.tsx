import { describe, it, expect, vi, beforeEach } from "vitest";
import { clientAction } from "./instances.$name";
import * as sessions from "~/sessions";

vi.mock("~/sessions", () => ({
  getClientSession: vi.fn(),
}));

describe("instances.$name clientAction", () => {
  const apiUrl = "https://api.test.com";
  const apiKey = "test-api-key";

  beforeEach(() => {
    vi.clearAllMocks();
    (sessions.getClientSession as any).mockReturnValue({ apiUrl, apiKey });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }));
  });

  it("sends correct payload for chatwoot-set intent when checkboxes are checked", async () => {
    const formData = new FormData();
    formData.append("intent", "chatwoot-set");
    formData.append("enabled", "true");
    formData.append("accountId", "123");
    formData.append("inboxId", "456");
    formData.append("token", "test-token");
    formData.append("url", "https://chatwoot.test.com");
    // Standard HTML checkbox value is "on" when checked
    formData.append("signMsg", "on");
    formData.append("reopenConversation", "on");
    formData.append("conversationPending", "on");

    const request = new Request("http://localhost/instances/test", {
      method: "POST",
      body: formData,
    });

    await clientAction({ params: { name: "test-instance" }, request } as any);

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/chatwoot/set/test-instance"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          enabled: true,
          accountId: "123",
          inboxId: "456",
          token: "test-token",
          url: "https://chatwoot.test.com",
          signMsg: true,
          reopenConversation: true,
          conversationPending: true,
        }),
      })
    );
  });

  it("sends correct payload for chatwoot-set intent when checkboxes are NOT checked", async () => {
    const formData = new FormData();
    formData.append("intent", "chatwoot-set");
    formData.append("enabled", "true");
    formData.append("accountId", "123");
    formData.append("inboxId", "456");
    formData.append("token", "test-token");
    formData.append("url", "https://chatwoot.test.com");
    // Checkboxes NOT appended (simulating unchecked state in HTML forms)

    const request = new Request("http://localhost/instances/test", {
      method: "POST",
      body: formData,
    });

    await clientAction({ params: { name: "test-instance" }, request } as any);

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/chatwoot/set/test-instance"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          enabled: true,
          accountId: "123",
          inboxId: "456",
          token: "test-token",
          url: "https://chatwoot.test.com",
          signMsg: false,
          reopenConversation: false,
          conversationPending: false,
        }),
      })
    );
  });
});
