// filepath: /Users/rohit_kumar2/AWS_LEARNING/module-serverless/lib/shared/productsData.ts
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
}

export const productData: Product[] = [
  {
    id: "1",
    title: "Product 1",
    description: "Description for Product 1",
    price: 10,
  },
  {
    id: "2",
    title: "Product 2",
    description: "Description for Product 2",
    price: 20,
  },
  {
    id: "3",
    title: "Product 3",
    description: "Description for Product 3",
    price: 30,
  },
];
