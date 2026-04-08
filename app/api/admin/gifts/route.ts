import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function ensureAdmin() {
  return cookies().get("admin_session")?.value === "ok";
}

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("gifts").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const payload = (await request.json()) as {
    name?: string;
    image_url?: string;
    suggested_link?: string;
  };

  if (!payload.name?.trim()) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gifts")
    .insert({
      name: payload.name.trim(),
      image_url: payload.image_url?.trim() || null,
      suggested_link: payload.suggested_link?.trim() || null,
      status: "disponivel",
    })
    .select("id,name,image_url,suggested_link,status,reserved_by,reserved_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
