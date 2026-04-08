import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function ensureAdmin() {
  return cookies().get("admin_session")?.value === "ok";
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!ensureAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const payload = (await request.json()) as { status?: "disponivel" | "reservado" };
  if (!payload.status) {
    return NextResponse.json({ error: "status_required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const updateData: Record<string, string | null> = { status: payload.status };

  if (payload.status === "disponivel") {
    updateData.reserved_by = null;
    updateData.reserved_at = null;
  }

  const { data, error } = await supabase
    .from("gifts")
    .update(updateData)
    .eq("id", params.id)
    .select("id,name,image_url,suggested_link,status,reserved_by,reserved_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!ensureAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("gifts").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
