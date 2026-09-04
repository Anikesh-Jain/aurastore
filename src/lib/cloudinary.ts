import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string = "ecommerce-platform"
): Promise<{ url: string; publicId: string }> {
  // If no live Cloudinary API secret provided, return a fallback placeholder to allow local development
  if (
    !process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_KEY === "your-cloudinary-api-key" ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn("⚠️ Cloudinary credentials not configured. Using fallback image URL.");
    const fallbackId = `local_${Date.now()}`;
    return {
      url: typeof fileBuffer === "string" && fileBuffer.startsWith("http")
        ? fileBuffer
        : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80`,
      publicId: fallbackId,
    };
  }

  return new Promise((resolve, reject) => {
    if (typeof fileBuffer === "string" && fileBuffer.startsWith("data:")) {
      cloudinary.uploader.upload(
        fileBuffer,
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      if (Buffer.isBuffer(fileBuffer)) {
        uploadStream.end(fileBuffer);
      } else {
        uploadStream.end(Buffer.from(fileBuffer));
      }
    }
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (
    !process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_KEY === "your-cloudinary-api-key"
  ) {
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Failed to delete asset from Cloudinary:", error);
    return false;
  }
}

export default cloudinary;

