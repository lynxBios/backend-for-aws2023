import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { SNS } from "@aws-sdk/client-sns";
import { v4 as uuidv4 } from 'uuid';

export const saveItem = async (data: any) => {
  try {
    const dynamoClient = new DynamoDBClient();
    const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);
    const productId = uuidv4();
    const { title, description, price, count } = data;

    const transactionItems = [{
      Put: {
        TableName: 'products',
        Item: {
          productId,
          description,
          price,
          title,
        },
      }
    },
    {
      Put: {
        TableName: 'stocks',
        Item: {
          product_id: productId,
          count
        },
      }
    }];

    await dynamoDB.send(
      new TransactWriteCommand({ TransactItems: transactionItems })
    );
  } catch(e) {
    console.log("error", e);
  }
}

export const calculateTotalCount = (products: {count: number}[]) => {
  return products.reduce((totalCount, product) => totalCount + product.count, 0);
}

export const sendEmail = async (products: any) => {
  const {
    REGION: region,
    ACCOUNT_ID: accountId,
    SNS_TOPIC_NAME: topicName,
  } = process.env;

  const totalCount = calculateTotalCount(products);

  const snsClient = new SNS();
  const paramsSNS= {
    Message: `New objects uploaded: ${JSON.stringify(products)}`,
    Subject: 'Subject',
    TopicArn: `arn:aws:sns:${region}:${accountId}:${topicName}`,
    MessageAttributes: {
      totalCost: {
        StringValue: totalCount.toString(),
        DataType: 'Number',        
      }
    }
  }

  try {
    await snsClient.publish(paramsSNS);
    console.log('Successfully published to sns');
  } catch (error) {
    console.error('Error publishing to sns:', error);
  }
}

export const catalogBatchProcess = async (event: any = {}) => {
  const records = event.Records;  
  if (!records) {
    console.log('Records not found');
  }

  const products = [];
  for (const record of records) {
    const data = JSON.parse(record.body);
    products.push(data);
    await saveItem(data);
  }

  console.log('Send email products ', products);
  await sendEmail(products);
}
