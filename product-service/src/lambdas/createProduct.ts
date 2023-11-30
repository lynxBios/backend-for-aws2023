import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

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
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Internal server error' }),
    };
  }
};
