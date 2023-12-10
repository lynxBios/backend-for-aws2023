import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { buildResponse } from './utils';

export const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    console.log('event', event);

    if (!event.body) {
      return buildResponse({ statusCode: 400, body: { message: 'Bad request, you are missing the parameter body' } });
    }

    const { title, description, price } = JSON.parse(event.body || '');
    const { count } = JSON.parse(event.body || '');

    if (typeof title !== 'string' || typeof description !== 'string' || typeof price !== 'number' || price <= 0) {
      return buildResponse({ statusCode: 400, body: { message: 'Invalid request data' } });
    }

    const productId = uuidv4();

    const params: DynamoDB.DocumentClient.TransactWriteItemsInput = {
      TransactItems: [
        {
          Put: {
            TableName: 'products',
            Item: {
              id: productId,
              title,
              description,
              price,
            },
          },
        },
        {
          Put: {
            TableName: 'stocks',
            Item: {
              product_id: productId,
              count,
            },
          },
        },
      ],
    };

    await dynamoDb.transactWrite(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Product created successfully' }),
    };
  } catch (error: any) {
    return buildResponse({ statusCode: 500, body: { message: error.message || 'Internal server error' } });
  }
};
