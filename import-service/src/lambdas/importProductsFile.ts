import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const importProductsFile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get the name parameter from the query string
    const fileName = event.queryStringParameters?.fileName;

    // Create a new Signed URL with the key 'uploaded/${name}'
    const s3 = new AWS.S3();
    const signedUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: 'bucket-for-task5',
      Key: `uploaded/${fileName}`,
      Expires: 60, 
    });
    
    return {
      statusCode: 200,
      body: signedUrl,
    };
  } catch (error) {    
    console.error(error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
