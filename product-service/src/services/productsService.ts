import { products } from "../lambdas/mocks";

const findAll = function() {
  return products;
}

const findItem = function( productId: string ) {
  return products.find(({ id }) => id === productId);
}

export { findAll, findItem }