import { Handler } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;
const stockTableName = process.env.STOCK_TABLE_NAME as string;

export const handler: Handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;
    console.log("Product Key:", { id: { S: productId } });
console.log("Stock Key:", { product_id: { S: productId } });
    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Product ID is required" }),
      };
    }

    // Fetch product details from the Products table
    const productCommand = new GetItemCommand({
      TableName: productsTableName,
      Key: { id: { S: productId } },
    });
    const productResult = await dynamoDB.send(productCommand);

    if (!productResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const product = {
      id: productResult.Item.id.S,
      title: productResult.Item.title.S,
      description: productResult.Item.description.S,
      price: parseFloat(productResult.Item.price.N || "0"),
    };

    // Fetch stock details from the Stock table
    const stockCommand = new GetItemCommand({
      TableName: stockTableName,
      Key: { product_id: { S: productId } }, // Corrected key attribute to product_id
    });
    const stockResult = await dynamoDB.send(stockCommand);

    const stockCount = stockResult.Item
      ? parseInt(stockResult.Item.count.N || "0")
      : 0;

    // Combine product and stock details
    const productWithStock = {
      ...product,
      count: stockCount,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(productWithStock),
    };
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error }),
    };
  }
};