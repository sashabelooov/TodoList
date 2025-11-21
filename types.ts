export type DayStatus = 'done' | 'missed' | null;

export interface ChecklistItem {
  id: string;
  title: string;
  // Map date string (YYYY-MM-DD) to a status
  history: Record<string, DayStatus>;
}

export interface ImageEditResult {
  imageUrl: string | null;
  error: string | null;
}