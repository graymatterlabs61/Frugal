import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config/unifiedConfig.js";

function buildClient(): S3Client | null {
  if (!config.r2.enabled) return null;
  return new S3Client({
    region: "auto",
    endpoint: config.r2.endpoint!,
    credentials: {
      accessKeyId: config.r2.accessKeyId!,
      secretAccessKey: config.r2.secretAccessKey!,
    },
  });
}

const client = buildClient();

function requireClient(): S3Client {
  if (!client) throw new Error("R2 storage is not configured (missing R2_* env vars)");
  return client;
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string
): Promise<void> {
  await requireClient().send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Returns a download URL for a file.
 * If R2_PUBLIC_URL is set (custom domain with public access enabled),
 * returns a plain URL — no expiry, no signing overhead.
 * Otherwise falls back to a presigned S3 URL (expires in expiresInSeconds).
 */
export async function getDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  if (config.r2.publicUrl) {
    return `${config.r2.publicUrl.replace(/\/$/, "")}/${key}`;
  }
  return getSignedUrl(
    requireClient(),
    new GetObjectCommand({ Bucket: config.r2.bucketName, Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

export async function deleteFile(key: string): Promise<void> {
  await requireClient().send(
    new DeleteObjectCommand({ Bucket: config.r2.bucketName, Key: key })
  );
}

export const r2 = { uploadFile, getDownloadUrl, deleteFile, enabled: config.r2.enabled };
