"use client";

import { useState } from "react";
import { Gift } from "@/lib/types";

type FormState = {
  name: string;
  image_url: string;
  suggested_link: string;
};

const initialForm: FormState = { name: "", image_url: "", suggested_link: "" };

export default function AdminGiftsManager({ initialGifts }: { initialGifts: Gift[] }) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts);
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<string | null>(null);

  async function createGift() {
    const response = await fetch("/api/admin/gifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setStatus("Falha ao criar presente.");
      return;
    }

    const created = (await response.json()) as Gift;
    setGifts((current) => [created, ...current]);
    setForm(initialForm);
    setStatus("Presente criado com sucesso.");
  }

  async function toggleStatus(gift: Gift) {
    const nextStatus = gift.status === "disponivel" ? "reservado" : "disponivel";
    const response = await fetch(`/api/admin/gifts/${gift.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      setStatus("Falha ao atualizar status.");
      return;
    }

    const updated = (await response.json()) as Gift;
    setGifts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function removeGift(giftId: string) {
    const response = await fetch(`/api/admin/gifts/${giftId}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("Falha ao remover presente.");
      return;
    }

    setGifts((current) => current.filter((gift) => gift.id !== giftId));
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Painel Administrativo</h1>
        <p className="text-sm text-slate-600">Gerencie os presentes disponíveis na lista.</p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Novo presente</h2>
        <div className="grid gap-2">
          <input className="rounded border px-3 py-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded border px-3 py-2" placeholder="URL da imagem" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <input className="rounded border px-3 py-2" placeholder="Link sugerido" value={form.suggested_link} onChange={(e) => setForm({ ...form, suggested_link: e.target.value })} />
          <button type="button" onClick={createGift} className="rounded bg-brand px-4 py-2 text-white">Adicionar</button>
        </div>
      </div>

      {status ? <p className="rounded bg-white p-3 text-sm shadow">{status}</p> : null}

      <ul className="space-y-3">
        {gifts.map((gift) => (
          <li key={gift.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="font-semibold">{gift.name}</p>
            <p className="text-sm">Status: {gift.status}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => toggleStatus(gift)} className="rounded border px-3 py-2 text-sm">Alternar status</button>
              <button type="button" onClick={() => removeGift(gift.id)} className="rounded border border-red-300 px-3 py-2 text-sm text-red-600">Remover</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
