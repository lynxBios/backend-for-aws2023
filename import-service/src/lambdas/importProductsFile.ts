import * as Joi from 'joi';
import { buildResponse } from '../utils/response';
import { ImportFolders } from '../utils/const';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSignedURL } from "../utils/createSignedURL";

const ImportUrl = Joi.object({
  name: Joi.string().required(),
});

const bucketName = 'bucket-for-task5';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('ImportProductsFile event:', event);

    const { value, error } = ImportUrl.validate(
      event.queryStringParameters || {}
    );

    if (error != null) {
      console.log('Validation error:', error.message);
      return buildResponse({ statusCode: 400, body: { message: error.message || "" }});
    }

    const { name: fileName } = value;

    if (!fileName.toLowerCase().endsWith('.csv')) {
      return buildResponse({ statusCode: 400, body: { message: 'CSV files required' }});
    }

    const objectKey = `${ImportFolders.UPLOADED}${fileName}`;
    const url = await createSignedURL(bucketName, objectKey);

    console.log('Created S3 upload URL:', url);
    return buildResponse({ statusCode: 200, body: { message: url } });
  } catch (err: unknown) {
    const error = err as Error;
    console.log('An error occurred:', error.message);
    return buildResponse({ statusCode: 500, body: { message: error.message || "" }});
  }
};
