#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

const BASE_URL = 'products';
const REGION = 'eu-central-1';
const PRODUCTS_TABLE_NAME = 'products';
const STOCKS_TABLE_NAME = 'stocks';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ProductsServiceStack', { env: { region: REGION } });

const createLambda = (name: string, props: NodejsFunctionProps ) => new NodejsFunction(stack, name, {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: REGION,
    PRODUCTS_TABLE_NAME,
    STOCKS_TABLE_NAME,    
  },
  ...props,
});

const productsTable = dynamodb.Table.fromTableName(
  stack,
  "ProductsTable",
  process.env.PRODUCTS_TABLE_NAME as string
);

const stocksTable = dynamodb.Table.fromTableName(
  stack,
  "StocksTable",
  process.env.STOCKS_TABLE_NAME as string
);

const getProductsList = createLambda('GetProductsListLambda', {
  entry: 'src/lambdas/getProductsList.ts',
  functionName: 'getProductsList',
});

const getProductsById = createLambda('GetProductsByIdLambda', {
  entry: 'src/lambdas/getProductsById.ts',
  functionName: 'getProductsById',
});

const createProduct = createLambda('CreateProductLambda', {
  entry: 'src/lambdas/createProduct.ts',
  functionName: 'createProduct',  
});

const api = new apiGateway.HttpApi(stack, 'ProductsApiGateway', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
    allowOrigins: ['*'],
  },
});

const grants = [
  productsTable.grantReadData(getProductsList),
  stocksTable.grantReadData(getProductsList),

  productsTable.grantReadData(getProductsById),
  stocksTable.grantReadData(getProductsById),

  productsTable.grantWriteData(createProduct),
  stocksTable.grantWriteData(createProduct),
];
grants.forEach((grant) => grant.assertSuccess());

api.addRoutes({
  path: `/${BASE_URL}`,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration('GetProductsListLambdaIntegration', getProductsList)
});

api.addRoutes({
  path: `/${BASE_URL}/{productId}`,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration('GetProductsByIdIntegration', getProductsById),
});

api.addRoutes({
  path: `/${BASE_URL}`,
  methods: [apiGateway.HttpMethod.POST],
  integration: new HttpLambdaIntegration('CreateProductLambdaIntegration', createProduct),
});

new cdk.CfnOutput(stack, 'ApiGatewayUrl', {
  value: api.url || '',
});
