#!/usr/bin/env node
import 'source-map-support/register';
import * as path from 'path';
import {
  aws_ec2 as ec2,
  aws_lambda as lambda,
  aws_apigateway as apigw,
  Duration,
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { AtlasBootstrapExample, AtlasServerlessBasicStack } from '../lib/feb3-stack'; // update "feb3" with name of your stack

const app = new cdk.App();
const env = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };

// the bootstrap stack
new AtlasBootstrapExample(app, 'mongodb-atlas-bootstrap-stack', { env });

type AccountConfig = {
  readonly orgId: string;
  readonly projectId?: string;
}

const MyAccount: AccountConfig = {
  orgId: '63234d3234ec0946eedcd7da', //update with your Atlas Org ID 
};

const MONGODB_PROFILE_NAME = 'development';

// the serverless stack with mongodb atlas serverless instance
const serverlessStack = new AtlasServerlessBasicStack(app, 'atlas-serverless-basic-stack', {
  env,
  ipAccessList: '46.137.146.59',  //input your static IP Address from NAT Gateway
  profile: MONGODB_PROFILE_NAME,
  ...MyAccount,
});

// Reference your VPC ID created in your AWS Account 
const vpc = ec2.Vpc.fromLookup(serverlessStack, 'VPC', {
  vpcId: 'vpc-0060b48b973dbe4a5', // Use your actual VPC ID here
});

// The demo lambda function.
const handler = new lambda.Function(serverlessStack, 'LambdaFunc', {
  code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/playground')),
  runtime: lambda.Runtime.PYTHON_3_10,
  handler: 'index.handler',
  timeout: Duration.seconds(30),

  vpc,
  vpcSubnets: {
    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
  },

  environment: {
    CONN_STRING_STANDARD: serverlessStack.connectionString,
    DB_USER_SECRET_ARN: serverlessStack.dbUserSecret.secretArn,
  },
});

// allow the handler to read the db user secret
serverlessStack.dbUserSecret.grantRead(handler);

// create the API Gateway REST API with the lambda handler.
new apigw.LambdaRestApi(serverlessStack, 'RestAPI', { handler });