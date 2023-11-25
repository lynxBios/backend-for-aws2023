//import { APIGatewayEvent } from 'aws-lambda';
//import { products } from './mocks';
import { buildResponse } from './utils';
import { findItem } from "../services/productsService";

const handler = async (event: { pathParameters: { productId: string | undefined } }) => {
  try {

    const productId  = event.pathParameters.productId || null;
    if (!productId) {
      return buildResponse({ statusCode: 400, body: { message: 'productId is required' } });
    }
    const product = findItem( productId );
    if (!product) {
      return buildResponse({ statusCode: 404, body: { message: 'Product not found' } });
    }
    return buildResponse({ statusCode: 200, body: product });
  } catch (error: any) {
    return buildResponse({ statusCode: 500, body: { message: error.message || '' } });
  }
}

export { handler };