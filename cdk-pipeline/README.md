# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## first time setup
* fork this repo
* create env variable for your org `export MONGODB_ATLAS_ORG_ID=XXXXXX`
* make sure you have GitHub access token stored in Secretes Manager with name `github-token`
* modify `input: CodePipelineSource.gitHub('ialek36/mern-cdk-ci-cd', 'main')` to point to your GitHub repo.  The code is in `cdk-pipeline-stacks.ts` file.
* run `cdk synth && cdk bootstrap && cdk deploy`

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
