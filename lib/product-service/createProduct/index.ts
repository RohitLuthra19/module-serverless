import { Handler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    // Validate input
    if (!body.title || !body.price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Title and price are required" }),
      };
    }

    const productId = uuidv4();

    // Create a new product item
    const command = new PutItemCommand({
      TableName: productsTableName,
      Item: {
        id: { S: productId },
        title: { S: body.title },
        description: { S: body.description || "" },
        price: { N: body.price.toString() },
      },
    });

    await dynamoDB.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Product created successfully",
        product: {
          id: productId,
          title: body.title,
          description: body.description || "",
          price: body.price,
        },
      }),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error!", error }),
    };
  }
};
