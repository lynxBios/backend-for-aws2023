import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importProductsFileLambda = new NodejsFunction(this, 'importProductsFileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './src/lambdas/importProductsFile.ts',      
      environment: {
        BUCKET_NAME: 'bucket-for-task5',
        REGION: 'eu-central-1',
      },
    });

    const importFileParserLambda = new NodejsFunction(this, 'importFileParserLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './src/lambdas/importFileParser.ts',      
      environment: {
        BUCKET_NAME: 'bucket-for-task5',
        REGION: 'eu-central-1',
      },
    });

    const bucket = new s3.Bucket(this, 'BucketForTask5', {
      bucketName: 'bucket-for-task5',
      autoDeleteObjects: true,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.GET,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
        },
      ],
      //blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(importFileParserLambda),
      {
        prefix: 'uploaded',
        suffix: '.csv',
      }
    );
    
    bucket.grantReadWrite(importProductsFileLambda);
    bucket.grantReadWrite(importFileParserLambda);
    bucket.grantDelete(importFileParserLambda);

    const BASE_URL = 'import';
    const API_PATH = `/${BASE_URL}`;

    const api = new apiGateway.HttpApi(this, 'ImportApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
      },
    });

    api.addRoutes({
      path: API_PATH,
      methods: [apiGateway.HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'ImportProductsFileLambdaIntegration',
        importProductsFileLambda
      ),
    });

    new cdk.CfnOutput(this, 'ApiImportUrl', {
      value: `${api.url}${BASE_URL}`,
    });
  }
}
