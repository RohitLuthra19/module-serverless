import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import * as csv from 'csv-parser';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler = async (event: { Records: any; }) => {
    try {
        console.log('Received S3 event:', event);

        for (const record of event.Records) {
            const key = record.s3.object.key;  // 'uploaded/filename.csv'
            console.log(`Processing file: ${key}`);

            const getObjectCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            const response = await s3Client.send(getObjectCommand);

            if (!response.Body) {
                console.error('S3 object has no body');
                continue; // Process the next record
            }
            const stream = response.Body as Readable;


            const parser = stream.pipe(csv());

            parser.on('data', (data) => {
                console.log('Parsed record:', data);
                //  process the data here.
            });

            parser.on('error', (error) => {
                console.error('Error parsing CSV:', error);
            });
           await finished(parser);
           console.log(`Finished processing file: ${key}`);
        }
        console.log('All files processed successfully.');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Files processed successfully' }),
        };
    } catch (error) {
        console.error('Error processing S3 event:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing S3 event', error }),
        };
    }
};