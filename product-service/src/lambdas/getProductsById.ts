import { buildResponse } from './utils';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactGetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);


const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { productId } = event.pathParameters || {};    
    if (!productId) {
      return buildResponse({ statusCode: 400, body: { message: 'productId is required' } });
    }
    const params = {
      TableName: 'products',
      Key: {
        id: { S: productId },
      },
    };
    const command = new GetCommand(params);
    const { Item } = await client.send(command);
    if (!Item) {
      return buildResponse({ statusCode: 404, body: { message: 'Product not found' } });
    }
    return buildResponse({ statusCode: 200, body: Item });
  } catch (error) {
    return buildResponse({ statusCode: 500, body: { message: error.message || '' } });
  }
}

export { handler };
