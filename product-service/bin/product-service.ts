#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import dotenv from 'dotenv';
//import { ProductServiceStack } from '../lib/product-service-stack';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

dotenv.config();

const app = new cdk.App();

const stack = new cdk.ProductServiceStack(app, id: 'ProductServiceStack', props: {
  
  env: { region: 'eu-central-1' },

});

const sharedLambdaProps: NodejsFunctionProps = {  
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
  }  
};

const getProductsList = new NodejsFunction(stack, id: 'GetProductsList', props: {
  ...sharedLambdaProps,
  functionName: 'GetProductsList',
  entry: 'src/lambdas/getProductsList.ts',
});

const api = new apiGateway.HttpApi(stack, id: 'GetProductsListApi', props: {
  corsPreflight: {
    allowHeaders: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
    allowOrigins: ['*'],
  },
});

api.addRoutes( options: {
  path: '/products',
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration(id: 'GetProductsListIntegration', getProductsList),
});