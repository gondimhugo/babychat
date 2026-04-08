export type GiftStatus = "disponivel" | "reservado";

export type Gift = {
  id: string;
  name: string;
  image_url: string | null;
  suggested_link: string | null;
  status: GiftStatus;
  reserved_by: string | null;
  reserved_at: string | null;
};

export type ReserveResult = {
  success: boolean;
  message: string;
  gift_id: string;
  reserved_by: string | null;
  reserved_at: string | null;
};
