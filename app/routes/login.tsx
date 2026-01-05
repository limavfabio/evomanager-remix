import { type ClientActionFunctionArgs, type ClientLoaderFunctionArgs, redirect, Form, useActionData, useNavigation } from "react-router";
import { getClientSession, setClientSession } from "~/sessions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export async function clientLoader() {
  const { apiUrl, apiKey } = getClientSession();
  if (apiUrl && apiKey) {
    return redirect("/");
  }
  return {};
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  const apiUrl = formData.get("apiUrl") as string;
  const apiKey = formData.get("apiKey") as string;

  if (!apiUrl || !apiKey) {
    return { error: "Por favor, forneça a URL da API e a Chave da API" };
  }

  try {
    new URL(apiUrl);
  } catch (e: any) {
    console.error("URL VALIDATION ERROR:", e);
    alert("URL Inválida: " + e.message);
    return { error: "URL da API inválida" };
  }

  setClientSession(apiUrl, apiKey);
  return redirect("/");
}

export default function Login() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Evo Manager
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Conecte-se à sua API Evolution
          </p>
        </div>

        <Form method="post" className="space-y-6">
          <div className="space-y-4">
            <Input
              label="URL da API"
              name="apiUrl"
              type="url"
              required
              placeholder="https://api.your-evo.com"
            />

            <Input
              label="Chave da API"
              name="apiKey"
              type="password"
              required
              placeholder="Sua Chave da API Global"
              error={actionData?.error}
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full"
          >
            Conectar
          </Button>
        </Form>
      </div>
    </div>
  );
}
