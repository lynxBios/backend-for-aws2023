import { findAll, findItem } from '../src/services/productsService';
import { handler as getProductsById } from '../src/lambdas/getProductsById';


describe('handler', () => {
  test('should return a non-empty result', async () => {
    expect(findAll()).not.toEqual([]);
  });

  test('should return a item by ID', async () => {
    const productId = '5';
    expect(findItem( productId )).not.toEqual([]);
  });

  test('should not return an item', async () => {
    const productId = '100500';
    expect(findItem( productId )).not.toEqual([]);
  });

  test("Get one product (200)", async () => {
    
    const response = await getProductsById({
      pathParameters: {
        productId: '5'
      }
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toEqual([]);
})  
});
