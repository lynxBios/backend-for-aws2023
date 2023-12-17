#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';
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


const lambdaRole = new iam.Role(stack, 'LambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
});

lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess'));
lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'));

const catalogItemsQueue = new sqs.Queue(stack, 'catalogItemsQueue', {
  queueName: "catalogItemsQueue",
  visibilityTimeout: cdk.Duration.seconds(40),
});

const catalogBatchProcessLambda = new NodejsFunction(stack, 'catalogBatchProcessLambda', {
  runtime: lambda.Runtime.NODEJS_18_X,
  //handler: 'catalogBatchProcess',
  entry: './src/lambdas/catalogBatchProcess.ts',
  functionName: 'catalogBatchProcess',
  role: lambdaRole,      
  environment: {
    CREATE_PRODUCT_TOPIC_ARN: 'arn:aws:sns:eu-central-1:730043614514:create-product-topic',
    REGION: 'eu-central-1',
    PRODUCTS_TABLE_NAME: 'products',
    STOCKS_TABLE_NAME: 'stocks',
    SQS_URL: catalogItemsQueue.queueUrl,
  },
});

const createProductTopic = new sns.Topic(stack, 'CreateProductTopic', {
  displayName: 'Create Product Topic',
});

createProductTopic.addSubscription(new subs.EmailSubscription('stv20595@gmail.com', {
  filterPolicy: {
    totalCount: sns.SubscriptionFilter.numericFilter({ greaterThan: 10 }),
  },
}));

createProductTopic.addSubscription(new subs.EmailSubscription('lregvjlke@gmail.com', {
  filterPolicy: {
    totalCount: sns.SubscriptionFilter.numericFilter({ lessThanOrEqualTo: 10 }),
  },
}));

createProductTopic.grantPublish(catalogBatchProcessLambda);

catalogBatchProcessLambda.addEventSource(new eventSources.SqsEventSource(catalogItemsQueue, {
  batchSize: 5,
}));


new cdk.CfnOutput(stack, 'QueueArn', {
  value: `Queue: ${catalogItemsQueue.queueName} arn: ${catalogItemsQueue.queueArn}`,
});    

new cdk.CfnOutput(stack, 'SNSArn', {
  value: `SNS name: ${createProductTopic.topicName} arn: ${createProductTopic.topicArn}`,
});
