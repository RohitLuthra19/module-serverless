import { Handler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;
const stockTableName = process.env.STOCK_TABLE_NAME as string;

export const handler: Handler = async (event) => {
    try {
        // Fetch products from the Products table
        const productsCommand = new ScanCommand({ TableName: productsTableName });
        const productsResult = await dynamoDB.send(productsCommand);
        const products = productsResult.Items || [];

        // Fetch stock from the Stock table
        const stockCommand = new ScanCommand({ TableName: stockTableName });
        const stockResult = await dynamoDB.send(stockCommand);
        const stock = stockResult.Items || [];

        // Join products and stock by productId
        const joinedProducts = products.map((product) => {
            const stockItem = stock.find((s) => s.product_id?.S === product.id?.S);
            return {
                id: product.id?.S || null,
                title: product.title?.S || null,
                description: product.description?.S || null,
                price: product.price?.N ? parseFloat(product.price.N) : 0, 
                count: stockItem?.count?.N ? parseInt(stockItem.count.N) : 0,
            };
        });

        return {
            statusCode: 200,
            body: JSON.stringify(joinedProducts),
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error fetching products", error }),
        };
    }
};
