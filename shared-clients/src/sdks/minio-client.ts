import { Client as MinioClient } from 'minio';
import { Readable } from 'stream';

/**
 * Service class for interacting with MinIO (S3-compatible) storage.
 */
export class MinioService {
    private static singleton: MinioService;

    private minioClient: MinioClient;
    private static readonly bucketName: string = process.env.MINIO_BUCKET_NAME;


    private constructor() {
        // Read environment variables
        const port = parseInt(process.env.MINIO_PORT || '9000', 10);
        const secure = process.env.MINIO_SECURE === 'true';

        // Initialize the MinIO Client
        this.minioClient = new MinioClient({
            endPoint: process.env.MINIO_ENDPOINT,
            port: port,
            useSSL: secure,
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
        });

        this.initializeBucket().catch(error => {
            console.error("MinIO Bucket Initialization Failed:", error);
        });
    }

    public static getInstance() {
        if (!MinioService.singleton) {
            MinioService.singleton = new MinioService();
        }
        return MinioService.singleton;
    }

    /**
     * Ensures the configured bucket exists. Creates it if it doesn't.
     */
    private async initializeBucket(): Promise<void> {
        try {
            const exists = await this.minioClient.bucketExists(MinioService.bucketName);
            if (!exists) {
                console.log(`MinIO: Bucket '${MinioService.bucketName}' does not exist. Creating...`);
                await this.minioClient.makeBucket(MinioService.bucketName);
                console.log(`MinIO: Bucket '${MinioService.bucketName}' created successfully.`);
            } else {
                console.log(`MinIO: Bucket '${MinioService.bucketName}' already exists.`);
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
        
        await this.minioClient.putObject(MinioService.bucketName, objectName, stream, size, {
            'Content-Type': contentType
        });
        
        console.log(`MinIO: Uploaded successfully: ${objectName}`);
        return `s3://${MinioService.bucketName}/${objectName}`;
    }

    /**
     * Retrieves a file object as a readable stream from MinIO.
     * @param objectName The name of the object to retrieve.
     * @returns A Readable stream for the file content.
     */
    public async getObjectStream(objectName: string): Promise<Readable> {
        console.log(`MinIO: Retrieving stream for ${objectName}`);
        try {
            const stream = await this.minioClient.getObject(MinioService.bucketName, objectName);
            return stream;
        } catch (error) {
            console.error(`MinIO: Failed to retrieve object ${objectName}:`, error);
            throw error;
        }
    }
}
