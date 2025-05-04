export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  images: string[];
  author: {
    id: string | undefined;
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}