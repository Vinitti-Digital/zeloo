"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

function subscribeToConnection(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function ConnectionSync() {
  const router = useRouter();
  const online = useSyncExternalStore(
    subscribeToConnection,
    getOnlineSnapshot,
    getServerSnapshot,
  );
  const previousOnline = useRef(online);

  useEffect(() => {
    const wasOnline = previousOnline.current;
    previousOnline.current = online;

    if (wasOnline === online) return;

    if (!online) {
      toast.message("Você está offline", {
        description:
          "Dá para abrir páginas já visitadas. Alterações pedem conexão.",
      });
      return;
    }

    toast.success("Conexão restabelecida. Atualizando dados…");
    router.refresh();
  }, [online, router]);

  if (online) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-40 border-b border-[#E7D3BB] bg-[#FFF1D2] px-4 py-2 text-center text-sm text-foreground"
    >
      <span className="inline-flex items-center justify-center gap-2">
        <WifiOff className="size-4 shrink-0 text-primary" aria-hidden />
        Você está offline. Páginas já visitadas ficam disponíveis; ao voltar a
        conexão, sincronizamos os dados.
      </span>
    </div>
  );
}
