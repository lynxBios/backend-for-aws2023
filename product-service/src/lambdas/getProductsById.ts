import { buildResponse } from './utils';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    console.log('event', event);
    const { productId } = event.pathParameters || {};     
    if (!productId) {
      console.log('no productId');
      return buildResponse({ statusCode: 400, body: { message: 'productId is required' } });
    }
    const params = {
      TableName: 'products',
      Key: {
        id: { S: productId },
      },
    };
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command) as { Item: any };
    if (!Item) {
      console.log('Product not found');
      return buildResponse({ statusCode: 404, body: { message: 'Product not found' } });
    }
    return buildResponse({ statusCode: 200, body: Item });
  } catch (error: any) {
    return buildResponse({ statusCode: 500, body: { message: error.message || '' } });
  }
}

export { handler };
