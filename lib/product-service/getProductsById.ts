import { productData } from "../../mock/product";

export const handler = async (event: any) => {
  // Use 'any' for event
  console.log("event:", event);
  const productId = event.pathParameters.productId;
  const product = productData.find((p) => p.id === productId);
  if (product) {
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" }),
    };
  }
};
