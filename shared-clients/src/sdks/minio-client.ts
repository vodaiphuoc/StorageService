import { Client as MinioClient } from 'minio';
import { Readable } from 'stream';
import * as winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
  });

/**
 * Service class for interacting with MinIO (S3-compatible) storage.
 */
export class MinioService {
    private static singleton: MinioService;

    private minioClient: MinioClient;
    private bucketName: string;


    private constructor(
        endPoint: string,
        port: number,
        secure: boolean,
        bucketName: string,
        accessKey: string,
        secretKey: string
    ) {
        this.bucketName = bucketName;
        try {
            // Initialize the MinIO Client
            this.minioClient = new MinioClient({
                endPoint: endPoint,
                port: port,
                useSSL: secure,
                accessKey: accessKey,
                secretKey: secretKey
            });
        } catch (error) {
            logger.error('MinIO Client Initialization Failed: ', { error: error });
            throw error;
        }

        this.initializeBucket().catch(error => {
            console.error("MinIO Bucket Initialization Failed:", error);
            logger.error('MinIO Bucket Initialization Failed: ', { error: error });
        });
    }

    public static getInstance(
        endPoint: string = '',
        port: number = 9001,
        secure: boolean = false,
        bucketName: string = 'mybucket',
        accessKey: string = 'accessKey',
        secretKey: string = 'secretKey'
    ) {
        if (!MinioService.singleton) {
            MinioService.singleton = new MinioService(endPoint,port,secure,bucketName, accessKey, secretKey);
        }
        return MinioService.singleton;
    }

    /**
     * Ensures the configured bucket exists. Creates it if it doesn't.
     */
    private async initializeBucket(): Promise<void> {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                console.log(`MinIO: Bucket '${this.bucketName}' does not exist. Creating...`);
                await this.minioClient.makeBucket(this.bucketName);
                console.log(`MinIO: Bucket '${this.bucketName}' created successfully.`);
            } else {
                console.log(`MinIO: Bucket '${this.bucketName}' already exists.`);
            }
        } catch (error) {
            console.error('Error checking/creating MinIO bucket:', error);
            throw error; // Re-throw to allow main service to handle critical failure
        }
    }

    /**
     * Uploads a file (or file chunk) stream to MinIO.
     * @param objectName The final name of the file (e.g., 'document-abc.pdf').
     * @param stream The readable stream of the file content.
     * @param size The size of the object in bytes.
     * @param contentType The MIME type.
     * @returns The S3 URI location.
     */
    public async uploadStream(
        objectName: string, 
        stream: Buffer, 
        size: number, 
        contentType: string
    ): Promise<string> {
        console.log(`MinIO: Starting upload for ${objectName}`);
        
        await this.minioClient.putObject(this.bucketName, objectName, stream, size, {
            'Content-Type': contentType
        });
        
        console.log(`MinIO: Uploaded successfully: ${objectName}`);
        return `s3://${this.bucketName}/${objectName}`;
    }

    /**
     * Retrieves a file object as a readable stream from MinIO.
     * @param objectName The name of the object to retrieve.
     * @returns A Readable stream for the file content.
     */
    public async getObjectStream(objectName: string): Promise<Readable> {
        console.log(`MinIO: Retrieving stream for ${objectName}`);
        try {
            const stream = await this.minioClient.getObject(this.bucketName, objectName);
            return stream;
        } catch (error) {
            console.error(`MinIO: Failed to retrieve object ${objectName}:`, error);
            throw error;
        }
    }
}
