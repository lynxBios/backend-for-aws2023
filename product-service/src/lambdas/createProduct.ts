import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { buildResponse } from './utils';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    console.log('event', event);
    const { title, description, price } = JSON.parse(event.body || '');
    
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: 'products',
      Item: {
        id: uuidv4(),
        title,
        description,
        price,
      },
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Product created successfully' }),
    };
  } catch (error: any) {
    if (!event.body) {
      return buildResponse({ statusCode: 400, body: { message: 'Bad request, you are missing the parameter body' } });
    }
    return buildResponse({ statusCode: 500, body: { message: error.message || 'Internal server error' } });
  }
};
