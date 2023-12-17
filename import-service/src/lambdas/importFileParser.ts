import { S3Event } from "aws-lambda";
import { Readable } from "stream";
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import {
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config } from "dotenv";
import { buildResponse } from "../utils/response";

config();

import csv = require("csv-parser");

const s3Client = new S3Client({ region: 'eu-central-1' });
const sqsClient = new SQSClient({ region: 'eu-central-1' });

const move = async ({ bucket, from, to, }: {
  bucket: string;
  from: string;
  to: string;
}) => {
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${from}`,
      Key: to,
    })
  );
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: from,
    })
  );
};

export const handler = async (event: S3Event) => {
  try {
    console.log("importFileParser lambda", JSON.stringify(event));

    const bucket = event.Records[0].s3.bucket.name;
    const fileName = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );
    const { Body: stream } = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: decodeURIComponent(fileName),
      })
    );
    if (!stream) return;

    await new Promise<void>((resolve, reject) => {
      (stream as Readable)
        .pipe(csv())
        .on('data', async (data: object) => {
          console.log("Data from parser:", data);
          await sqsClient.send(
            new SendMessageCommand({
              //QueueUrl: process.env.QUEUE_URL,
              QueueUrl: 'https://sqs.eu-central-1.amazonaws.com/730043614514/catalogItemsQueue',
              MessageBody: JSON.stringify(data),
            })            
          );
          console.log("Message sent to SQS", data);
        })
        
        .on("end", async () => {
          console
          await move({
            from: fileName,
            to: fileName.replace("uploaded/", "parsed/"),
            bucket,
          });
          console.log("File moved");
          resolve();
        })

        .on("error", (error: any) => {
          reject(error);
        });
    });
    console.log("Parsing succeed");
  } catch (err: any) {
    console.log("Parsing error", err);
  }
};
