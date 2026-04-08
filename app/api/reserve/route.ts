import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { giftId?: string; guestName?: string };

  if (!body.giftId) {
    return NextResponse.json({ error: "gift_id_required" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("reserve_gift", {
    p_gift_id: body.giftId,
    p_guest_name: body.guestName,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data?.[0] ?? { success: false, message: "Falha ao reservar." });
}
