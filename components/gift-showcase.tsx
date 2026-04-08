"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Gift, ReserveResult } from "@/lib/types";

export default function GiftShowcase({ initialGifts }: { initialGifts: Gift[] }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [gifts, setGifts] = useState<Gift[]>(initialGifts);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [guestName, setGuestName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("public-gifts")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gifts" }, (payload) => {
        const updated = payload.new as Gift;

        setGifts((current) => {
          const merged = current.map((gift) => (gift.id === updated.id ? { ...gift, ...updated } : gift));
          return merged.filter((gift) => gift.status === "disponivel");
        });

        if (updated.status === "reservado" && selectedGift?.id === updated.id) {
          setSelectedGift(null);
          setFeedback("Este presente acabou de ser reservado por outra pessoa.");
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "gifts" }, (payload) => {
        const inserted = payload.new as Gift;
        if (inserted.status === "disponivel") {
          setGifts((current) => [inserted, ...current]);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedGift?.id, supabase]);

  async function handleReserve() {
    if (!selectedGift) return;

    setIsSubmitting(true);
    setFeedback(null);

    const { data, error } = await supabase.rpc("reserve_gift", {
      p_gift_id: selectedGift.id,
      p_guest_name: guestName,
    });

    setIsSubmitting(false);

    if (error) {
      setFeedback("Não foi possível reservar agora. Tente novamente.");
      return;
    }

    const result = (data?.[0] ?? null) as ReserveResult | null;
    if (!result?.success) {
      setFeedback(result?.message ?? "Este presente não está mais disponível.");
      setSelectedGift(null);
      return;
    }

    setFeedback(result.message);
    setGuestName("");
    setSelectedGift(null);
  }

  return (
    <section className="mx-auto max-w-5xl p-4">
      <h1 className="mb-1 text-2xl font-bold">Lista Universal de Chá de Bebê</h1>
      <p className="mb-4 text-sm text-slate-600">Escolha um presente disponível e confirme com seu nome.</p>

      {feedback ? <p className="mb-4 rounded-lg bg-white p-3 text-sm shadow">{feedback}</p> : null}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((gift) => (
          <li key={gift.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            {gift.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gift.image_url} alt={gift.name} className="mb-3 h-40 w-full rounded-lg object-cover" />
            ) : null}
            <h2 className="text-lg font-semibold">{gift.name}</h2>
            {gift.suggested_link ? (
              <a href={gift.suggested_link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand underline">
                Ver link sugerido
              </a>
            ) : null}
            <button
              type="button"
              disabled={gift.status !== "disponivel"}
              className="mt-4 w-full rounded-lg bg-brand px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setSelectedGift(gift)}
            >
              Vou dar este presente
            </button>
          </li>
        ))}
      </ul>

      {selectedGift ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4">
            <h3 className="text-lg font-bold">Reservar: {selectedGift.name}</h3>
            <input
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              className="mt-3 w-full rounded-lg border px-3 py-2"
              placeholder="Seu nome"
            />
            <div className="mt-3 flex gap-2">
              <button className="w-full rounded-lg border px-3 py-2" onClick={() => setSelectedGift(null)} type="button">
                Cancelar
              </button>
              <button
                className="w-full rounded-lg bg-brand px-3 py-2 text-white disabled:opacity-60"
                onClick={handleReserve}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? "Reservando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
