export interface Blog {
  title: string;
  author: string;
  description: string;
  userId: string;
  image: {
    public_id: String;
    url: String;
  };
  createdAt: Date;
}

export type BlogResponse = {
  message?: string;
  success?: boolean;
  blog: Blog;
};

export type blogCredential = {
  _id?: string;
  title: string;
  author: string;
  file: File & { type: "image/*" | "video/*" };
  description: string;
};
