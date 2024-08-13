export interface User {
  id: number;
  name: string;
  company_name: string | null;
  created_at: string; // or Date, depending on how you want to handle dates
  is_online: number | boolean; // 1 for online, 0 for offline (boolean can be used if preferred)
  unread_count: number;
  last_message: string;
  last_message_time: string;
  last_message_type: string;
  images: string; // This could be an array if multiple images, e.g., string[]
  status: string;
  isBlock: number; // 1 for blocked, 0 for not blocked (boolean can be used if preferred)
}


export enum AlertType {
  Success,
  Error,
  Info,
  Warning,
}
