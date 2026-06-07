export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  modality: 'Remoto' | 'Presencial' | 'Híbrido';
  publishedAt: string;
  score: number;
}
