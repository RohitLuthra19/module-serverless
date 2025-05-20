import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.BUCKET_NAME;
const UPLOADED_FOLDER = process.env.UPLOADED_FOLDER;

export const handler = async (event: { queryStringParameters: { name: any; }; }) => {
    try {
        const fileName = event.queryStringParameters?.name;

        if (!fileName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'File name is required' }),
            };
        }

        const key = `${UPLOADED_FOLDER}/${fileName}`; // uploaded/filename.csv

        const putObjectCommand = new GetObjectCommand({ // Changed to GetObjectCommand
            Bucket: BUCKET_NAME,
            Key: key,
        });
      // Expires in 1 minute
        const signedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 60 }); // Short expiration

        return {
            statusCode: 200,
            body: JSON.stringify({ signedUrl }),
        };
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to generate signed URL', error }),
        };
    }
};