export interface Module {
  id: string;
  title: string;
  description: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: Date | string;
  updatedAt: Date | string;
}
