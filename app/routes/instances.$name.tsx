import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";

import { type ClientLoaderFunctionArgs, type ClientActionFunctionArgs, useLoaderData, Form, Link, useActionData, useNavigation, useSearchParams } from "react-router";
import { getClientSession } from "~/sessions";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";


export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const { apiUrl, apiKey } = getClientSession();
  if (!apiUrl || !apiKey) throw new Error("Unauthorized");
  const name = params.name;

  // We fetch all and filter to get details, or use a specific endpoint if we had one.
  // Evolution API v2 doesn't have a direct "fetchOne" but we can filter fetchInstances.
  const response = await fetch(`${apiUrl}/instance/fetchInstances`, {
    headers: { apikey: apiKey },
  });


  if (!response.ok) throw new Error("Failed to fetch instance details");

  const data = await response.json();
  const instances = Array.isArray(data) ? data : (data.instances || []);
  const instance = instances.find((i: any) => (i.name || i.instanceName) === name);

  console.log(instance)

  if (!instance) throw new Error("Instance not found");

  return { instance, apiUrl, apiKey };
}

export async function clientAction({ params, request }: ClientActionFunctionArgs) {
  const { apiUrl, apiKey } = getClientSession();
  const name = params.name;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "chatwoot-set") {
    try {
      const payload = {
        enabled: formData.get("enabled") === "true",
        accountId: String(formData.get("accountId")),
        inboxId: String(formData.get("inboxId")),
        token: formData.get("token") as string,
        url: formData.get("url") as string,
        signMsg: formData.get("signMsg") === "true",
        reopenConversation: formData.get("reopenConversation") === "true",
        conversationPending: formData.get("conversationPending") === "true",
      };

      const response = await fetch(`${apiUrl}/chatwoot/set/${name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey!,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update Chatwoot settings");
      }
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  if (intent === "instance-settings-set") {
    try {
      const payload = {
        rejectCall: formData.get("rejectCall") === "on",
        msgCall: "",
        groupsIgnore: formData.get("groupsIgnore") === "on",
        alwaysOnline: formData.get("alwaysOnline") === "on",
        readMessages: formData.get("readMessages") === "on",
        readStatus: formData.get("readStatus") === "on",
        syncFullHistory: false
      };

      const response = await fetch(`${apiUrl}/settings/set/${name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey!,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update instance settings");
      }
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  return null;
}

export default function InstanceShow() {
  const { instance, apiUrl } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<{ error?: string, success?: boolean }>();
  const navigation = useNavigation();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isChatwootModalOpen, setIsChatwootModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSubmitting = navigation.state === "submitting";
  const name = instance.name || instance.instanceName;
  const status = instance.connectionStatus || instance.status || "unknown";

  const chatwoot = instance.Chatwoot || {
    enabled: false,
    accountId: "",
    inboxId: "",
    token: "",
    url: "",
    signMsg: true,
    reopenConversation: true,
    conversationPending: false,
  };

  // Close modals on success
  if (actionData?.success && !isSubmitting) {
    if (isChatwootModalOpen) setIsChatwootModalOpen(false);
    if (isSettingsModalOpen) setIsSettingsModalOpen(false);
  }

  const fetchQr = async () => {
    setLoading(true);
    setQrCode(null);
    try {
      const { apiKey } = getClientSession();
      const cleanUrl = apiUrl!.endsWith('/') ? apiUrl!.slice(0, -1) : apiUrl!;

      const response = await fetch(`${cleanUrl}/instance/connect/${name}`, {
        headers: { apikey: apiKey! }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();
      let code = data.base64 || data.code;

      if (code && typeof code === "string" && !code.startsWith("data:") && !code.includes("@")) {
        code = `data:image/png;base64,${code}`;
      }

      if (!code && data.qrcode?.base64) {
        code = data.qrcode.base64;
      }

      if (!code) {
        throw new Error("No QR code data received from API");
      }

      setQrCode(code);
    } catch (e: any) {
      console.error("QR Fetch Error:", e);
      alert(e.message || "Failed to fetch QR Code");
    } finally {
      setLoading(false);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const isNew = searchParams.get("new") === "true";
    const isDisconnected = status !== "open" && status !== "CONNECTED";

    if (isNew && isDisconnected && !qrCode && !loading) {
      fetchQr();
      // Remove the query param so it doesn't refetch on manual reload
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("new");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, status, qrCode, loading]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              ← Dashboard
            </Link>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {name}
            </h1>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider
            ${status === "open" || status === "CONNECTED"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {status.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {instance.profilePicUrl ? (
                <img src={instance.profilePicUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-400">
                  {name[0]}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{name}</h2>
                <p className="text-sm text-zinc-500">{instance.profileName || "WhatsApp Instance"}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-zinc-400 uppercase font-bold tracking-widest mb-1">Integration</p>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{instance.integration || "Baileys"}</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                    Connection Details
                  </h3>
                  <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <DetailRow label="ID" value={instance.id} />
                    <DetailRow label="Instance Token" value={instance.token} isCode />
                    <DetailRow label="WhatsApp JID" value={instance.ownerJid || "Not connected"} />
                    <DetailRow label="Created At" value={new Date(instance.createdAt).toLocaleString()} />
                    <DetailRow label="Last Activity" value={new Date(instance.updatedAt).toLocaleString()} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                      Instance Settings
                    </h3>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => setIsSettingsModalOpen(true)}>
                      Configure
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SettingCard label="Always Online" active={instance.Setting?.alwaysOnline} />
                    <SettingCard label="Ignore Groups" active={instance.Setting?.groupsIgnore} />
                    <SettingCard label="Reject Calls" active={instance.Setting?.rejectCall} />
                    <SettingCard label="Read Messages" active={instance.Setting?.readMessages} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
                    Active Integrations
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${instance.Chatwoot?.enabled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
                            CW
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Chatwoot</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">
                              {instance.Chatwoot?.enabled ? 'Connected' : 'Not Configured'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs font-bold h-7" onClick={() => setIsChatwootModalOpen(true)}>
                          Configure
                        </Button>
                      </div>

                      {instance.Chatwoot?.enabled && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 space-y-2">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Webhook URL</p>
                          <div className="flex items-center gap-2">
                            <input
                              readOnly
                              value={`${apiUrl!.replace(/\/$/, '')}/chatwoot/webhook/${name}`}
                              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400"
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 px-3 text-[10px] relative overflow-hidden"
                              onClick={() => {
                                navigator.clipboard.writeText(`${apiUrl!.replace(/\/$/, '')}/chatwoot/webhook/${name}`);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                            >
                              <span className={`transition-transform duration-300 ${copied ? '-translate-y-8' : 'translate-y-0'}`}>Copy</span>
                              <span className={`absolute inset-0 flex items-center justify-center bg-zinc-900 text-white transition-transform duration-300 ${copied ? 'translate-y-0' : 'translate-y-8'}`}>
                                Copied!
                              </span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl p-8 border border-dashed border-zinc-200 dark:border-zinc-800 h-fit">
                  {status === "open" || status === "CONNECTED" ? (
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        ✓
                      </div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Connected & Active</p>
                      <p className="text-sm text-zinc-500 max-w-[200px] mx-auto">This instance is authenticated and processing events.</p>
                    </div>
                  ) : qrCode ? (
                    <div className="space-y-4 text-center">
                      <div className="bg-white p-4 rounded-2xl shadow-2xl border border-zinc-200">
                        <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48 mx-auto" />
                      </div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Scan with WhatsApp Linked Devices</p>
                      <Button variant="secondary" size="sm" onClick={() => setQrCode(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 py-8">
                      <p className="text-sm text-zinc-500">Authentication required.</p>
                      <Button
                        onClick={fetchQr}
                        isLoading={loading}
                        className="w-full"
                      >
                        Generate QR Code
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
                    Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <StatBox label="Messages" value={instance._count?.Message || 0} />
                    <StatBox label="Chats" value={instance._count?.Chat || 0} />
                    <StatBox label="Contacts" value={instance._count?.Contact || 0} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isChatwootModalOpen} onOpenChange={setIsChatwootModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogTitle>Chatwoot Integration</DialogTitle>
          <DialogDescription>
            Bind this WhatsApp instance to your Chatwoot API inbox.
          </DialogDescription>

          <Form method="post" className="space-y-4" id="chatwoot-form">
            <input type="hidden" name="intent" value="chatwoot-set" />
            <input type="hidden" name="enabled" value="true" id="chatwoot-enabled" />

            {actionData?.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg text-xs text-red-600 dark:text-red-400">
                {actionData.error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Account ID" name="accountId" type="number" required defaultValue={chatwoot.accountId} />
              <Input label="Inbox ID / Name" name="inboxId" required defaultValue={chatwoot.inboxId || chatwoot.nameInbox} />
            </div>
            <Input label="Access Token" name="token" type="password" required defaultValue={chatwoot.token} />
            <Input label="Chatwoot URL" name="url" type="url" required defaultValue={chatwoot.url} placeholder="https://chatwoot.example.com" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-zinc-50 dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <Checkbox
                label="Sign Messages"
                name="signMsg"
                defaultChecked={chatwoot.signMsg}
                description="Add signature to sent messages"
              />
              <Checkbox
                label="Reopen Conv."
                name="reopenConversation"
                defaultChecked={chatwoot.reopenConversation}
                description="Automatic conversation reopening"
              />
              <Checkbox
                label="Pending Conv."
                name="conversationPending"
                defaultChecked={chatwoot.conversationPending}
                description="Mark as pending by default"
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <div>
                {chatwoot.enabled && (
                  <Button
                    type="submit"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 text-xs font-bold"
                    onClick={(e) => {
                      const input = document.getElementById("chatwoot-enabled") as HTMLInputElement;
                      if (input) input.value = "false";
                    }}
                  >
                    Disconnect Integration
                  </Button>
                )}
              </div>
              <div className="flex space-x-3">
                <DialogClose render={<Button variant="secondary">Cancel</Button>} />
                <Button type="submit" isLoading={isSubmitting}>
                  Save Configuration
                </Button>
              </div>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Instance Settings</DialogTitle>
          <DialogDescription>
            Update your WhatsApp instance behavior and preferences.
          </DialogDescription>

          <Form method="post" className="space-y-6">
            <input type="hidden" name="intent" value="instance-settings-set" />

            {actionData?.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg text-xs text-red-600 dark:text-red-400">
                {actionData.error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 bg-zinc-50 dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <Checkbox
                  label="Ignore Groups"
                  name="groupsIgnore"
                  defaultChecked={instance.Setting?.groupsIgnore}
                  description="Do not process messages from groups"
                />

                <Checkbox
                  label="Always Online"
                  name="alwaysOnline"
                  defaultChecked={instance.Setting?.alwaysOnline}
                  description="Show as online even when inactive"
                />

                <Checkbox
                  label="Reject Calls"
                  name="rejectCall"
                  defaultChecked={instance.Setting?.rejectCall}
                  description="Automatically decline incoming calls"
                />

                <Checkbox
                  label="Read Receipts"
                  name="readMessages"
                  defaultChecked={instance.Setting?.readMessages}
                  description="Send blue ticks when reading messages"
                />

                <Checkbox
                  label="Read Status"
                  name="readStatus"
                  defaultChecked={instance.Setting?.readStatus}
                  description="Mark status as viewed"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <DialogClose render={<Button variant="secondary">Cancel</Button>} />
              <Button type="submit" isLoading={isSubmitting}>
                Save Settings
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value, isCode }: { label: string; value: string; isCode?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 gap-1">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">{label}</span>
      <span className={`text-sm text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[300px] ${isCode ? 'font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function SettingCard({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${active ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-zinc-300 dark:bg-zinc-700 shadow-transparent'}`} />
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-center">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  )
}
