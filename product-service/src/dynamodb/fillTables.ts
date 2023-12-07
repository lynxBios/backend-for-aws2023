import { v4 as uuidv4 } from 'uuid';
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const fillTables = async () => {
  try {
    const products = new Array(100).fill(null).map((_, index) => ({
      id: uuidv4(),
      title: `Some Stuff${index}`,
      description: `Awesome description for Some Stuff${index}`,
      price: (index + 1) * 10,
    }));

    const stocks = products.map((product) => ({
      product_id: product.id,
      count: Math.floor(Math.random() * 10) + 1,
    }));

    for (const product of products) {
      const params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: 'products',
        Item: product,
      };

      await dynamoDb.put(params).promise();
    }

    for (const stock of stocks) {
      const params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: 'stocks',
        Item: stock,
      };

      await dynamoDb.put(params).promise();
    }

    console.log('Tables filled with test data successfully!');
  } catch (error) {
    console.error('Error filling tables with test data:', error);
  }
};

fillTables();
