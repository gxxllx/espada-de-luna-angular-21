export interface ImageS3 {
  name: string;
  type: string;
}

export interface ImageS3Payload {
  images: ImageS3[];
}

export interface ImageUploadResponse {
  url: string;
  key: string;
  name: string;
}
