import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AtlasBasic } from '@mongodbatlas-awscdk/atlas-basic';
import { readFileSync, writeFileSync } from 'fs';

export class AtlasIntegInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orgId = this.node.tryGetContext('MONGODB_ATLAS_ORG_ID') || process.env.MONGODB_ATLAS_ORG_ID;
    // const replicationSpecs = [
    //   {
    //     "numShards": 1,
    //     "advancedRegionConfigs": [
    //       {
    //         "analyticsSpecs": {
    //           "ebsVolumeType": "STANDARD",
    //           "instanceSize": "M10",
    //           "nodeCount": 1
    //         },
    //         "electableSpecs": {
    //           "ebsVolumeType": "STANDARD",
    //           "instanceSize": "M10",
    //           "nodeCount": 3
    //         },
    //         "priority": 7,
    //         "regionName": "US_EAST_1"
    //       }
    //     ]
    //   }
    // ]

    // const atlas = new AtlasBasic(this, 'atlas-basic', {
    //   clusterProps: {
    //     replicationSpecs: replicationSpecs
    //   },
    //   projectProps: {
    //     orgId: orgId,
    //   },
    //   ipAccessListProps: {
    //     accessList: [
    //       { ipAddress: '0.0.0.0/0', comment: 'My first IP address' }
    //     ]
    //   }
    // });

    // new cdk.CfnOutput(this, "atlas-url", {
    //   value: (atlas.mCluster.props.connectionStrings ?? "UNDEFINED").toString(),
    //   exportName: "atlas-url",
    // });

    new cdk.CfnOutput(this, "hello-world", {
      value: "Hi there!",
      exportName: "hello-world-url",
    });

    writeFileSync("./myexport.sh", "echo \"hello\"", {
      flag: 'w',
    });

  }
}
