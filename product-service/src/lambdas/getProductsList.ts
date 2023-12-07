import { buildResponse } from "./utils";

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const scan = async (tableName: string) => {
  const scanResults = await dynamo.scan({
    TableName: tableName
  }).promise();

  return scanResults.Items;
}

export const handler = async () => {
  console.log('GET all products');
  try {    
    const scanResultsProducts = await scan(process.env.PRODUCTS_TABLE_NAME!);
    const scanResultsStocks = await scan(process.env.STOCKS_TABLE_NAME!);

    const combinedResults = scanResultsProducts.map((product: any) => {
      const stock = scanResultsStocks.find((stock: any) => stock.product_id === product.id);
      return {
        id: product.id,
        count: stock.count,
        price: product.price,
        title: product.title,
        description: product.description,
      };
    });
    return buildResponse({ statusCode: 200, body: combinedResults });
  } catch (error: any) {
    return buildResponse({ statusCode: 500, body: { message: error.message || "" }});
  }
};
