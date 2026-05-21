import { S3Client } from "@aws-sdk/client-s3";

export function createR2Client(): S3Client {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "[r2] Missing credentials: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY must be set"
    );
  }

  return new S3Client({
    // R2 requires an explicit region value; "auto" causes signature errors
    region: "us-east-1",
    endpoint,
    forcePathStyle: false,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function r2Configured(): boolean {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.CDN_BASE_URL
  );
}
