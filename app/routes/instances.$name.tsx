import { type ClientLoaderFunctionArgs, type ClientActionFunctionArgs, useLoaderData, Form, Link } from "react-router";
import { getClientSession } from "~/sessions";
import { Button } from "~/components/ui/button";
import { useState } from "react";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const { apiUrl, apiKey } = getClientSession();
  const name = params.name;

  // We fetch all and filter to get details, or use a specific endpoint if we had one.
  // Evolution API v2 doesn't have a direct "fetchOne" but we can filter fetchInstances.
  const response = await fetch(`${apiUrl}/instance/fetchInstances`, {
    headers: { apikey: apiKey! },
  });

  if (!response.ok) throw new Error("Failed to fetch instance details");

  const instances = await response.json();
  const instance = instances.find((i: any) => (i.name || i.instanceName) === name);

  if (!instance) throw new Error("Instance not found");

  return { instance, apiUrl, apiKey };
}

export async function clientAction({ params, request }: ClientActionFunctionArgs) {
  const { apiUrl, apiKey } = getClientSession();
  const name = params.name;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "get-qr") {
    try {
      const response = await fetch(`${apiUrl}/instance/connect/${name}`, {
        headers: { apikey: apiKey! }
      });
      const data = await response.json();
      return { qr: data.code || data.base64 || null };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  return null;
}

export default function InstanceShow() {
  const { instance, apiUrl } = useLoaderData<typeof clientLoader>();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const name = instance.name || instance.instanceName;
  const status = instance.connectionStatus || instance.status || "unknown";

  const fetchQr = async () => {
    setLoading(true);
    try {
      const { apiKey } = getClientSession();
      const response = await fetch(`${apiUrl}/instance/connect/${name}`, {
        headers: { apikey: apiKey! }
      });
      const data = await response.json();
      let code = data.code || data.base64;

      if (code && !code.startsWith("data:")) {
        code = `data:image/png;base64,${code}`;
      }

      setQrCode(code || null);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch QR Code");
    } finally {
      setLoading(false);
    }
  };

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
              <div className="space-y-4">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Connection Details</h3>
                <div className="space-y-3">
                  <DetailRow label="ID" value={instance.id} />
                  <DetailRow label="Number" value={instance.number || "Not connected"} />
                  <DetailRow label="Created At" value={new Date(instance.createdAt).toLocaleDateString()} />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-8 border border-dashed border-zinc-200 dark:border-zinc-800">
                {status === "open" || status === "CONNECTED" ? (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      ✓
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">Already Connected</p>
                    <p className="text-sm text-zinc-500">This instance is active and ready.</p>
                  </div>
                ) : qrCode ? (
                  <div className="space-y-4 text-center">
                    <div className="bg-white p-4 rounded-xl shadow-inner border border-zinc-200">
                      <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48 mx-auto" />
                    </div>
                    <p className="text-sm text-zinc-500">Scan this code with WhatsApp</p>
                    <Button variant="secondary" size="sm" onClick={() => setQrCode(null)}>Clear</Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-zinc-500">Instance is not connected.</p>
                    <Button
                      onClick={fetchQr}
                      isLoading={loading}
                      className="w-full sm:w-auto"
                    >
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-zinc-50 dark:border-zinc-900 last:border-0">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[200px]">{value}</span>
    </div>
  )
}
