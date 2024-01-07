import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import "dotenv/config";


const envaironmentVariable = process.env.GITHUB_CREDENTIALS ?? '';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda  that is triggered by API Gateway when some client tries to get protected resource
    const basicAuthorizerLambda = new NodejsFunction(this, 'basicAuthorizerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './src/lambdas/basicAuthorizer.ts',
      functionName: 'basicAuthorizer',
      environment: {
        GITHUB_CREDENTIALS: envaironmentVariable,
        REGION: 'eu-central-1',
      }
    });

    basicAuthorizerLambda.grantInvoke({
      grantPrincipal: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    new cdk.CfnOutput(this, "basicAuthorizerArn", {
      value: basicAuthorizerLambda.functionArn,
      exportName: 'AuthorizationServiceAuthorizerArn',
    });

  }
}
