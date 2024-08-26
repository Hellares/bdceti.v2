export type ReviewWithTransformedUser = {
  id: number;
  rating: number;
  comment: string;
  productId: string;
  productName: string;
  userId: number;
  userName: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type ProductReviewsWithAverageRating = {
  reviews: ReviewWithTransformedUser[];
  averageRating: number;
};

export type ReviewResponse = {
  id: number;
  rating: number;
  comment: string;  
  productId: string;
  productName: string;
  userId: number;
  userName: string;
  createdAt: Date;
  updatedAt?: Date;
};