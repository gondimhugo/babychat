"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function login() {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setError("Senha inválida.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <section className="mx-auto grid min-h-[70vh] max-w-md place-items-center p-4">
      <div className="w-full rounded-xl border bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Acesso do Administrador</h1>
        <p className="mb-3 text-sm text-slate-600">Entre com a senha configurada no ambiente.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 w-full rounded border px-3 py-2"
          placeholder="Senha"
        />
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
        <button type="button" onClick={login} className="w-full rounded bg-brand px-4 py-2 text-white">
          Entrar
        </button>
      </div>
    </section>
  );
}
