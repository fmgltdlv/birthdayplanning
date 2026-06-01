export interface CapsuleEntry {
  id: string;
  type: 'note' | 'photo';
  authorName: string | null;
  body: string | null;
  mimeType: string | null;
  createdAt: number;
  hasMedia: boolean;
  hasThumb: boolean;
}

export interface CapsuleComment {
  id: string;
  entryId: string;
  authorName: string;
  body: string;
  createdAt: number;
}
