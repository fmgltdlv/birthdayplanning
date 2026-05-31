export interface CapsuleEntry {
  id: string;
  type: 'note' | 'photo';
  authorName: string | null;
  body: string | null;
  mimeType: string | null;
  createdAt: number;
  hasMedia: boolean;
}
