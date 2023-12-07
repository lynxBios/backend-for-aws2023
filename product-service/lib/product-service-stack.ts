import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const productsTable = dynamodb.Table.fromTableName(
      this,
      "ProductsTable",
      process.env.PRODUCTS_TABLE_NAME as string
    );
    
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      "StocksTable",
      process.env.STOCKS_TABLE_NAME as string
    );
  }
}
