import { Construct } from "constructs";
import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import {
  aws_s3 as s3,
  aws_s3_notifications as s3Notifications,
  aws_lambda as lambda,
  aws_dynamodb as dynamoDb,
} from "aws-cdk-lib";

export class SimpleCdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const myBucket = new s3.Bucket(this, "myFirstBucket", {
      bucketName: "simple-cdk-pipeline-bucket",
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const mySampleTable = new dynamoDb.Table(this, "mySampleTable", {
      tableName: "mySampleTable",
      billingMode: dynamoDb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "uuid",
        type: dynamoDb.AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const myLambda = new lambda.Function(this, "uploadHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lib"),
      handler: "uploadHandler.handler",
      environment: {
        TABLE_NAME: mySampleTable.tableName,
      },
    });

    const lambdaS3Notification = new s3Notifications.LambdaDestination(
      myLambda
    );

    mySampleTable.grantWriteData(myLambda);
    myBucket.grantRead(myLambda);
    myBucket.addObjectCreatedNotification(lambdaS3Notification);
  }
}
