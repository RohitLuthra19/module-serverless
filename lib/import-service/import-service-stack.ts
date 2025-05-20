import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class ImportServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Task 5.1: S3 Bucket Creation
        const uploadedFolderName = 'uploaded';
        const importBucket = new s3.Bucket(this, 'ImportBucket', {
            bucketName: 'import-service-bucket-' + this.account + '-' + this.region, 
            versioned: true, 
        });

        // Task 5.2: Lambda Function Setup and API Gateway Integration
        const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFileFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'importProductsFile')), 
            environment: {
                BUCKET_NAME: importBucket.bucketName,
                UPLOADED_FOLDER: uploadedFolderName,
            },
        });

        // Grant the Lambda function permissions to read and write to the S3 bucket.  Crucial for putObject and getSignedUrl
        importBucket.grantReadWrite(importProductsFileLambda);

        // Create a policy statement for S3:PutObject.  Needed for pre-signed URLs
        const putObjectPolicyStatement = new iam.PolicyStatement({
            actions: ['s3:PutObject'],
            resources: [`${importBucket.bucketArn}/${uploadedFolderName}/*`],
        });

        //and add to the lambda
        importProductsFileLambda.addToRolePolicy(putObjectPolicyStatement);

        const api = new apigateway.RestApi(this, 'ImportServiceAPI');
        const importResource = api.root.addResource('import');
        importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda));

        // Task 5.3: Lambda Function Creation and S3 Event Configuration
        const importFileParserLambda = new lambda.Function(this, 'ImportFileParserFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'importFileParser')), 
            environment: {
                BUCKET_NAME: importBucket.bucketName,
            },
        });

        // Grant the Lambda function permissions to read from the S3 bucket.
        importBucket.grantRead(importFileParserLambda);


        // Add S3 event notification to trigger the Lambda function
        importBucket.addEventNotification(
            s3.EventType.OBJECT_CREATED,
            new s3notifications.LambdaDestination(importFileParserLambda),
            { prefix: `${uploadedFolderName}/` } 
        );
    }
}
