import { productData } from "../../mock/product";

export const handler = async (event: any) => {
  // Use 'any' for event, or define a type
  console.log("event:", event);
  return {
    statusCode: 200,
    body: JSON.stringify(productData),
  };
};
