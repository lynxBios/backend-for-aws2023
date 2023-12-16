import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from "aws-cdk-lib/aws-iam";
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    })

    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess'));
    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'));

    const catalogItemsQueue = new sqs.Queue(this, 'catalogItemsQueue', {
      queueName: "catalogItemsQueue",
      visibilityTimeout: cdk.Duration.seconds(40),
    });
    
    const catalogBatchProcessLambda = new NodejsFunction(this, 'catalogBatchProcessLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
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

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
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


    new cdk.CfnOutput(this, 'QueueArn', {
      value: `Queue: ${catalogItemsQueue.queueName} arn: ${catalogItemsQueue.queueArn}`,
    });    
    
    new cdk.CfnOutput(this, 'SNSArn', {
      value: `SNS name: ${createProductTopic.topicName} arn: ${createProductTopic.topicArn}`,
    });
  }
}
