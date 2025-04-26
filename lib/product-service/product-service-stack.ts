import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import * as path from "path";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the Lambda Layer
    const sharedLayer = new lambda.LayerVersion(this, "SharedLayer", {
      code: lambda.Code.fromAsset(path.join(__dirname, "../shared-layer")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: "A layer for shared product data",
    });

    // Lambda function for getProductsList
    const getProductsListLambda = new lambda.Function(
      this,
      "GetProductsListFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "getProductsList")), 
        layers: [sharedLayer],
      }
    );

    // Lambda function for getProductsById
    const getProductsByIdLambda = new lambda.Function(
      this,
      "GetProductsByIdFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "getProductsById")), 
        layers: [sharedLayer],
      }
    );

    // API Gateway
    const api = new apigateway.RestApi(this, "ProductServiceAPI");
    const productsResource = api.root.addResource("products");
    productsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsListLambda)
    );
    const productResource = productsResource.addResource("{productId}");
    productResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsByIdLambda)
    );
  }
}
