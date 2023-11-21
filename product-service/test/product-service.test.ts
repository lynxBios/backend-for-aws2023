import { handler } from '../src/lambdas/getProductsList';
import { buildResponse } from '../src/lambdas/utils';
import { APIGatewayEvent } from 'aws-lambda';
import { products } from '../src/lambdas/mocks';

describe('handler', () => {
  test('should return a successful response with products when productId is provided', async () => {
    const event: APIGatewayEvent = {
      pathParameters: {
        productId: '1'
      }
    };

    const response = await handler(event);

    expect(response).toEqual(buildResponse({ statusCode: 200, body: { product: products[0] } }));
  });

  test('should return a 400 error response when productId is not provided', async () => {
    const invalidProductId = ""
    const event: APIGatewayEvent = {
      pathParameters: {
        productId: invalidProductId
      }
    };

    const response = await handler(event);

    expect(response).toEqual(buildResponse({ statusCode: 400, body: { message: 'productId is required' } }));
  });

  test('should return a 404 error response when product is not found', async () => {
    const event: APIGatewayEvent = {
      pathParameters: {
        productId: '999'
      }
    };

    const response = await handler(event);

    expect(response).toEqual(buildResponse({ statusCode: 404, body: { message: 'Product not found' } }));
  });

  test('should return a 500 error response when an error occurs', async () => {
    const event: APIGatewayEvent = {
      pathParameters: {
        productId: '1'
      }
    };

    // Mock the buildResponse function to throw an error
    jest.spyOn(buildResponse, 'buildResponse').mockImplementation(() => {
      throw new Error('Test error');
    });

    const response = await handler(event);

    expect(response).toEqual(buildResponse({ statusCode: 500, body: { message: 'Test error' } }));
  });
});