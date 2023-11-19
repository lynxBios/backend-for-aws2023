import { APIGatewayEvent } from 'aws-lambda';
import { products } from './mocks';
import { buildResponse } from './utils';

const handler = async (event: APIGatewayEvent) => {
  try {
    const { productId } = event.pathParameters || {};
    if (!productId) {
      return buildResponse({ statusCode: 400, body: { message: 'productId is required' } });
    }
    const product = products.find(({ id }) => id === productId);
    if (!product) {
      return buildResponse({ statusCode: 404, body: { message: 'Product not found' } });
    }
    return buildResponse({ statusCode: 200, body: { product } });
  } catch (error: any) {
    return buildResponse({ statusCode: 500, body: { message: error.message || '' } });
  }
}

export { handler };