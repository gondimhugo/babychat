import GiftShowcase from "@/components/gift-showcase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Gift } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("gifts")
    .select("id,name,image_url,suggested_link,status,reserved_by,reserved_at")
    .eq("status", "disponivel")
    .order("created_at", { ascending: true });

  const gifts = (data ?? []) as Gift[];

  return <GiftShowcase initialGifts={gifts} />;
}
