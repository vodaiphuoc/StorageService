import { Request, Response } from 'express';
import express from 'express';
import * as crypto from 'crypto';

import {
    ChunkUploadHeaders,
    InitUploadHeaders,
    InitUploadBody,
    InitUploadReponse
} from '@clone-google-drive/commons';

import { MinioService } from '@clone-google-drive/shared-clients';

import {
    ChunkUploadBody
} from '@models/upload.model';

import { getLogger } from '@utils/logger';

import { DBService } from '@lib/prisma';
import { Status } from '@generated-prisma/client';

const logger = getLogger(__filename);


export const handleInitUpload = async (req: Request, res: Response) => {
    try {
        const requestHeaders: InitUploadHeaders = req.headers as InitUploadHeaders;
        const requestBody: InitUploadBody = req.body as InitUploadBody;

        const fileId = crypto.randomUUID();

        const dbService: DBService = DBService.getInstance();
        await dbService.createFile({
            id: fileId,
            fileName: requestBody['file-name'],
            folderPath: requestBody['file-path'],
            mimeType: requestBody['mine-type'],
            totalChunk: requestBody['total-chunks'],
            isComplete: false,
            createdAt: new Date(),
            uploadStatus: Status.PENDING,
            userId: requestHeaders['user-id']
        });

        const responseData: InitUploadReponse = {
            "fileId": fileId
        }
        return res.status(200).json(responseData);
    } catch (error) {
        logger.error('Init upload field', {error: error});
        return res.status(500).json({ 
            message: "Failed to initialize file upload due to a server error." 
        });
    }
    
};




/**
 * Middleware to ensure the request body is handled as a raw buffer.
 * MUST be applied to the specific route before the handler.
 */
export const rawBodyParser = express.raw({
    type: 'application/octet-stream',
    limit: 2 * 10 ** 6,
});


/**
 * Handler for receiving and processing individual file chunks.
 */
export const handleChunkUpload = async (req: Request, res: Response) => {
    try {
        const headers: ChunkUploadHeaders = req.headers as ChunkUploadHeaders;
        // 2. Validate body type (Express.js provides the body as a Buffer)
        const chunk: ChunkUploadBody = req.body as ChunkUploadBody;
        
        const minioService = MinioService.getInstance();
        const s3Path = await minioService.uploadStream(
            `${headers['file-id']}_${headers['chunk-index']}`,
            chunk,
            chunk.length,
            headers['content-type']
        )
        const chunkId = crypto.randomUUID();

        const dbService: DBService = DBService.getInstance();
        await dbService.createChunk({
            id: chunkId,
            chunkId: parseInt(headers['chunk-index'],10),
            storagePath: s3Path,
            scanStatus: Status.PENDING,
            fileId: headers['file-id']
        });

        res.sendStatus(200);
        return;
    } catch (error) {
        logger.error('Chunk upload field', {error: error});
        return res.status(500).json({ 
            message: "Failed to initialize file upload due to a server error." 
        });
    }
    
};

/**
 * Handler to finalize the upload after all chunks are received.
 */
export const finalizeUpload = (req: Request, res: Response): void => {
    // In a production app, you would verify all chunks are present before finalizing.
    const { fileId } = req.body;

    // Logic to reassemble files (omitted for brevity)
    // 1. Get total chunks from metadata/DB
    // 2. Loop through all temp chunks and append them to the final file
    // 3. Delete the temporary chunk files

    res.status(200).send({ message: `File ${fileId} successfully assembled.` });
};