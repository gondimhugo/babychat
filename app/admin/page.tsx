import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminGiftsManager from "@/components/admin-gifts-manager";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Gift } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isLogged = cookies().get("admin_session")?.value === "ok";
  if (!isLogged) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("gifts")
    .select("id,name,image_url,suggested_link,status,reserved_by,reserved_at")
    .order("created_at", { ascending: false });

  return <AdminGiftsManager initialGifts={(data ?? []) as Gift[]} />;
}
