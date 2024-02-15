import * as path from 'path';
import {
  App, Stack, StackProps,
  Duration,
  CfnOutput,
  SecretValue,
  aws_secretsmanager as secretsmanager,
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import {
  MongoAtlasBootstrap,
  MongoAtlasBootstrapProps,
  AtlasBasicResources,
  AtlasServerlessBasic,
  ServerlessInstanceProviderSettingsProviderName,
} from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';


export class AtlasBootstrapExample extends cdk.Stack {
  constructor (scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const roleName = 'MongoDB-Atlas-CDK-Excecution'
    const mongoDBProfile = 'development'   

    const bootstrapProperties: MongoAtlasBootstrapProps = {
      roleName: roleName,
      secretProfile: mongoDBProfile,
      typesToActivate: [`ServerlessInstance`, ...AtlasBasicResources]
    }

    new MongoAtlasBootstrap(this, 'cdk-bootstrap', bootstrapProperties)
  }
}

export interface AtlasServerlessBasicStackProps extends StackProps {
  readonly profile: string;
  readonly orgId: string;
  readonly ipAccessList: string;
}
export class AtlasServerlessBasicStack extends Stack {
  readonly dbUserSecret: secretsmanager.ISecret;
  readonly connectionString: string;
  constructor(scope: Construct, id: string, props: AtlasServerlessBasicStackProps) {
    super(scope, id, props);

    const stack = Stack.of(this);
    const projectName = `${stack.stackName}-proj`;

    const dbuserSecret = new secretsmanager.Secret(this, 'DatabaseUserSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'serverless-user' }),
        generateStringKey: 'password',
        excludeCharacters: '%+~`#$&*()|[]{}:;<>?!\'/@"\\=-.,',
      },
    });

    this.dbUserSecret = dbuserSecret;
    const ipAccessList = props.ipAccessList;

    // see https://github.com/mongodb/awscdk-resources-mongodbatlas/blob/main/examples/l3-resources/atlas-serverless-basic.ts#L22
    const basic = new AtlasServerlessBasic(this, 'serverless-basic', {
      serverlessProps: {
        profile: props.profile,
        providerSettings: {
          providerName: ServerlessInstanceProviderSettingsProviderName.SERVERLESS,
          regionName: 'EU_WEST_1',
        },
      },
      projectProps: {
        orgId: props.orgId,
        name: projectName,
      },
      dbUserProps: {
        username: 'serverless-user',
      },
      ipAccessListProps: {
        accessList: [
          { ipAddress: ipAccessList, comment: 'My first IP address' },
        ],
      },
      profile: props.profile,
    });

    this.connectionString = basic.mserverless.getAtt('ConnectionStrings.StandardSrv').toString();

    new CfnOutput(this, 'ProjectName', { value: projectName });
    new CfnOutput(this, 'ConnectionString', { value: this.connectionString });
  }
}
