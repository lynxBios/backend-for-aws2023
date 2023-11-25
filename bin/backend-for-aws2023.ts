#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendForAws2023Stack } from '../lib/backend-for-aws2023-stack';

const app = new cdk.App();
new BackendForAws2023Stack(app, 'BackendForAws2023Stack', {  
    env: { account: '730043614514', region: 'eu-central-1' },


  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});