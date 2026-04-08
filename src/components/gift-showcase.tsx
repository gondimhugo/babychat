"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Gift = {
  id: string;
  name: string;
  image_url: string | null;
  suggested_link: string | null;
  status: "disponivel" | "reservado";
};

type ReserveResult = {
  success: boolean;
  message: string;
  gift_id: string;
  reserved_by: string | null;
  reserved_at: string | null;
};

export default function GiftShowcase({ initialGifts }: { initialGifts: Gift[] }) {
  const supabase = useMemo(() => createClientComponentClient(), []);

  const [gifts, setGifts] = useState<Gift[]>(initialGifts);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [guestName, setGuestName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("gifts-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "gifts" },
        (payload) => {
          const updated = payload.new as Gift;

          setGifts((current) => {
            const merged = current.map((gift) =>
              gift.id === updated.id ? { ...gift, ...updated } : gift,
            );
            return merged.filter((gift) => gift.status === "disponivel");
          });

          // Se o item aberto no modal foi reservado em outra aba/usuário
          if (updated.status === "reservado" && selectedGift?.id === updated.id) {
            setSelectedGift(null);
            setFeedback("Este presente acabou de ser reservado por outra pessoa.");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, selectedGift?.id]);

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
      setFeedback("Não foi possível reservar agora. Tente novamente em instantes.");
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
      <h1 className="mb-4 text-2xl font-bold">Lista de Chá de Bebê</h1>

      {feedback && <p className="mb-4 rounded bg-slate-100 p-3 text-sm">{feedback}</p>}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((gift) => (
          <li key={gift.id} className="rounded-xl border p-4 shadow-sm">
            {gift.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gift.image_url} alt={gift.name} className="mb-3 h-40 w-full rounded object-cover" />
            ) : null}

            <h2 className="text-lg font-semibold">{gift.name}</h2>

            {gift.suggested_link && (
              <a
                href={gift.suggested_link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-blue-600 underline"
              >
                Ver link sugerido
              </a>
            )}

            <button
              type="button"
              onClick={() => setSelectedGift(gift)}
              className="mt-4 w-full rounded-lg bg-pink-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={gift.status !== "disponivel"}
            >
              Vou dar este presente
            </button>
          </li>
        ))}
      </ul>

      {selectedGift && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4">
            <h3 className="text-lg font-bold">Reservar: {selectedGift.name}</h3>
            <p className="mb-3 text-sm text-slate-600">Informe seu nome para confirmar a reserva.</p>

            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="mb-3 w-full rounded border px-3 py-2"
              placeholder="Seu nome"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedGift(null)}
                className="w-full rounded border px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReserve}
                disabled={isSubmitting}
                className="w-full rounded bg-pink-600 px-4 py-2 text-white disabled:opacity-60"
              >
                {isSubmitting ? "Reservando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
