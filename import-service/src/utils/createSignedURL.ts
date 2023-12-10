import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "node:stream";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client();

export const createSignedURL = async (
  bucketName: string,
  key: string,
): Promise<string> => {
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  const signedURL = await getSignedUrl(s3Client, putCommand, {
    expiresIn: 60,
  });
  return signedURL;
};

export const getObject = async (options: {
  bucketName: string;
  key: string;
}): Promise<Readable> => {
  const { bucketName, key } = options;

  console.log(`try getting object ${bucketName}:${key}`);
  const getObjectResult = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: `${key}`,
    }),
  );
  if (getObjectResult.Body instanceof Readable) {
    console.log(`received object read stream`);
    return getObjectResult.Body;
  } else {
    throw new Error("Failed to get object");
  }
};

export const copyObject = async (options: {
  from: {
    bucketName: string;
    key: string;
  };
  to: {
    bucketName: string;
    key: string;
  };
}): Promise<void> => {
  const { from, to } = options;

  console.log(
    `copying object from ${from.bucketName}:${from.key} to ${to.bucketName}:${to.key}`,
  );
  const copyObjectResult = await s3Client.send(
    new CopyObjectCommand({
      CopySource: `${from.bucketName}/${from.key}`,
      Bucket: to.bucketName,
      Key: to.key,
    }),
  );
  console.log(
    `copied object with http status code ${copyObjectResult.$metadata.httpStatusCode}`,
  );
  if (copyObjectResult.$metadata.httpStatusCode !== 200) {
    throw new Error("Failed to copy object");
  }
};

export const deleteObject = async (options: {
  bucketName: string;
  key: string;
}): Promise<void> => {
  const { bucketName, key } = options;
  console.log(`trying to delete object ${bucketName}:${key}`);
  const deleteObjectResult = await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );

  console.log(
    `deleted object with http status code ${deleteObjectResult.$metadata.httpStatusCode}`,
  );
  if (deleteObjectResult.$metadata.httpStatusCode !== 204) {
    throw new Error("Failed to delete object");
  }
};
