import { type ClientLoaderFunctionArgs, type ClientActionFunctionArgs, redirect, useLoaderData, Form, useSubmit, Link } from "react-router";
import { getClientSession, clearClientSession } from "~/sessions";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "~/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "~/components/ui/alert-dialog";

export function meta() {
  return [
    { title: "Dashboard | Evo Manager" },
    { name: "description", content: "Manage your Evolution API instances" },
  ];
}

export async function clientLoader() {
  const { apiUrl, apiKey } = getClientSession();

  if (!apiUrl || !apiKey) {
    return redirect("/login");
  }

  try {
    const response = await fetch(`${apiUrl}/instance/fetchInstances`, {
      headers: {
        apikey: apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API Key");
      }
      const errText = await response.text();
      throw new Error(`Failed to fetch instances: ${response.status} ${errText}`);
    }

    const data = await response.json();
    console.log("Evolution API Data:", data);

    const instances = Array.isArray(data) ? data : (data.instances || []);

    return { instances, apiUrl, apiKey };
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    return {
      instances: [],
      error: error?.message || "Failed to connect to Evolution API",
      apiUrl,
      apiKey: null,
    };
  }
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const { apiUrl, apiKey } = getClientSession();

  if (intent === "logout") {
    clearClientSession();
    return redirect("/login");
  }

  if (intent === "create-instance") {
    const instanceName = formData.get("instanceName") as string;
    if (!instanceName) return { error: "Instance name is required" };

    try {
      const response = await fetch(`${apiUrl}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey!,
        },
        body: JSON.stringify({
          instanceName,
          token: "",
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create instance");
      }

      return { success: true };
    } catch (e: any) {
      console.error("CREATE ERROR:", e);
      return { error: e.message };
    }
  }

  if (intent === "delete-instance") {
    const instanceName = formData.get("instanceName") as string;
    if (!instanceName) return { error: "Instance name is required" };

    try {
      const response = await fetch(`${apiUrl}/instance/delete/${instanceName}`, {
        method: "DELETE",
        headers: {
          apikey: apiKey!,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete instance");
      }

      return { success: true };
    } catch (e: any) {
      console.error("DELETE ERROR:", e);
      return { error: e.message };
    }
  }

  return null;
}

export default function Dashboard() {
  const { instances, error, apiUrl } = useLoaderData<typeof clientLoader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; name: string }>({ open: false, name: "" });
  const submit = useSubmit();

  const performDelete = (instanceName: string) => {
    const formData = new FormData();
    formData.append("intent", "delete-instance");
    formData.append("instanceName", instanceName);
    submit(formData, { method: "post" });
    setDeleteConfirm({ open: false, name: "" });
  };

  const handleDeleteRequest = (instanceName: string, status: string) => {
    const s = status.toLowerCase();
    const needsConfirmation = ["open", "connected", "disconnected"].includes(s);

    if (needsConfirmation) {
      setDeleteConfirm({ open: true, name: instanceName });
    } else {
      performDelete(instanceName);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center">
              <span className="text-zinc-50 dark:text-zinc-900 font-bold">E</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 hidden sm:block">
              Evo Manager
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Connected to</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                {apiUrl}
              </span>
            </div>
            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <Button variant="ghost" size="sm" type="submit" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                Logout
              </Button>
            </Form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Instances</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Manage your Evolution API instances</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger render={<Button size="md">+ New Instance</Button>} />
            <DialogContent>
              <DialogTitle>Create Instance</DialogTitle>
              <DialogDescription>
                Provide a unique name for your new WhatsApp instance.
              </DialogDescription>

              <Form method="post" onSubmit={() => setIsModalOpen(false)} className="space-y-4">
                <input type="hidden" name="intent" value="create-instance" />
                <Input
                  label="Instance Name"
                  name="instanceName"
                  required
                  placeholder="My_Business_WA"
                />
                <div className="flex justify-end space-x-3 mt-6">
                  <DialogClose render={<Button variant="secondary">Cancel</Button>} />
                  <Button type="submit">Create</Button>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-6">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </p>
          </div>
        )}

        {instances.length === 0 && !error ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
            <p className="text-zinc-500 dark:text-zinc-400">No instances found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((item: any, index: number) => {
              const name = item?.name || item?.instanceName || `Instance ${index}`;
              const status = item?.connectionStatus || item?.status || "unknown";
              const profile = item?.profileName || item?.ownerJid || "No Profile";
              const pic = item?.profilePicUrl;

              return (
                <ContextMenu key={name}>
                  <ContextMenuTrigger>
                    <div className="group relative bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-default">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {pic ? (
                            <img src={pic} alt={name} className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                              {name[0]}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                              {name}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {profile}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider
                          ${status === "open" || status === "CONNECTED"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                            }`}
                        >
                          {status.toUpperCase()}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-[10px] text-zinc-400 font-medium">
                          {item.integration || "WHATSAPP"}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="group-hover:translate-x-1 transition-transform p-0 h-auto font-semibold"
                          render={<Link to={`/instances/${name}`} />}
                        >
                          Manage <span className="ml-1">→</span>
                        </Button>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem render={<Link to={`/instances/${name}`} />}>View Details</ContextMenuItem>
                    <ContextMenuItem>Restart Instance</ContextMenuItem>
                    <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <ContextMenuItem destructive onClick={() => handleDeleteRequest(name, status)}>
                      Delete Instance
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        )}
      </main>

      {/* Custom Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, name: "" })}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Instance</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the instance <span className="font-bold text-zinc-900 dark:text-zinc-100">"{deleteConfirm.name}"</span>? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end space-x-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => performDelete(deleteConfirm.name)}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
