import { Request, Response } from 'express';
import express from 'express';
import * as crypto from 'crypto';

import {
    ChunkUploadHeaders,
    InitUploadHeaders,
    InitUploadBody,
    InitUploadReponse,
    ChunkEtag
} from '@clone-google-drive/commons';

import {
    completeUploadBody,
    completeUploadHeaders
} from '@clone-google-drive/commons';


import { MinioService, FileEtag } from '@clone-google-drive/shared-clients';

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
        const minioService = MinioService.getInstance();

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

        const uploadId = await minioService.initUpload(fileId, requestBody['mine-type']);

        const responseData: InitUploadReponse = {
            "fileId": fileId,
            "uploadId": uploadId
        }
        return res.status(200).json(responseData);

    } catch (error) {
        logger.error(`Init upload field ${error}`);
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
    limit: 5 * 1024 * 1024,
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
        const etag: ChunkEtag = await minioService.uploadPart(
            headers['file-id'],
            headers['upload-id'],
            parseInt(headers['chunk-index'],10),
            headers['mine-type'],
            chunk
        )

        res.status(200).json(etag);
        return;
    } catch (error) {
        logger.error(`Chunk upload field: ${error}`);
        return res.status(500).json({ 
            message: "Failed to initialize file upload due to a server error." 
        });
    }
    
};

/**
 * Handler to finalize the upload after all chunks are received.
 */
export const finalizeUpload = async (req: Request, res: Response) => {
    const dbService: DBService = DBService.getInstance();
    const minioService = MinioService.getInstance();
    const requestHeaders = req.headers as completeUploadHeaders;
    const requestBody = req.body as completeUploadBody;

    try {
        
        const fileEtag: FileEtag = await minioService.completeUpload(
            requestBody['file-id'],
            requestBody['upload-id'],
            requestBody.etags
        );

        logger.info(`finalizeUpload, fileEtag: ${fileEtag}`);

        await dbService.updateUploadStatus(requestBody['file-id'], requestHeaders['user-id'], 'SUCCESS');

        return res.status(200).json({
            successFileId: requestBody['file-id']
        });
        
    } catch (error) {
        logger.error(`complete upload field ${error}`);
        await dbService.updateUploadStatus(requestBody['file-id'], requestHeaders['user-id'], 'FAILED');
        return res.status(500).json({ 
            message: "Failed to initialize file upload due to a server error." 
        });      
    }
    
};