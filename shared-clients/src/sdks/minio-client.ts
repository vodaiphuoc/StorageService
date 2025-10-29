import { Client as MinioClient, ClientOptions } from 'minio';

import { Readable } from 'stream';
import * as winston from 'winston';

import { MinioChunkEtag, FileEtag } from '../models/minio.model';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.errors({stack : true})
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
                secretKey: secretKey,
                partSize: 5 * 1024 * 1024
            });
        } catch (error) {
            logger.error(`MinIO Client Initialization Failed: ${error}`);
            throw error;
        }

        this.initializeBucket().catch(error => {
            logger.error(`MinIO Bucket Initialization Failed: ${error}`);
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
     * Init multi part upload
     * @param {string} objectName : object key to save and retrieve
     * @param {string} contentType : content-type
     * @returns 
     */
    public async initUpload(
        objectName: string,
        contentType: string
    ) {
        return await this.minioClient.initiateNewMultipartUpload(
            this.bucketName,
            objectName,
            {
                "Content-Type": contentType
            }
        );
    }
    

    /**
     * Upload chunk
     * @param objectName
     * @param uploadId uploadId return from initUpload method
     * @param chunkId The size of the object in bytes.
     * @param contentType The MIME type.
     * @returns etag value
     */
    public async uploadPart(
        objectName: string,
        uploadId: string, 
        chunkId: number, 
        contentType: string,
        chunk: Buffer
    ): Promise<MinioChunkEtag> {
        console.log(`MinIO: Starting upload for ${objectName}, ${contentType}, ${chunkId}`);
        
        const etag = await this.minioClient.uploadPart({
            bucketName: this.bucketName,
            objectName: objectName,
            uploadID: uploadId,
            partNumber: chunkId,
            headers: {
                'Content-Type': contentType
            }
        },
        chunk
        );

        return {
            part: etag.part,
            etag: etag.etag
        };
    }

    /**
     * Finsh and merge all chunks into single object
     * @param objectName 
     * @param uploadId 
     * @param etags 
     */
    public async completeUpload(
        objectName: string,
        uploadId: string,
        etags: MinioChunkEtag[]
    ): Promise<FileEtag> {
        return await this.minioClient.completeMultipartUpload(
            this.bucketName,
            objectName,
            uploadId,
            etags
        )
    }

    /**
     * Retrieves a file object as a readable stream from MinIO.
     * @param objectName The name of the object to retrieve.
     * @returns A Readable stream for the file content.
     */
    public async getObjectStream(objectName: string): Promise<Readable> {
        try {
            console.log(`MinIO: Retrieving stream for ${objectName}`);
            const stream = await this.minioClient.getObject(this.bucketName, objectName);
            return stream;
        } catch (error) {
            console.error(`MinIO: Failed to retrieve object ${objectName}:`, error);
            throw error;
        }
    }
}
