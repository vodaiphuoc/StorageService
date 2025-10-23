import { Request, Response } from 'express';
import express from 'express';
import * as z from "zod";
import * as crypto from 'crypto';
import * as winston from 'winston';

import {
    ChunkUploadHeaders,
    ChunkUploadHeadersSchema,
    InitUploadReponse
} from '@clone-google-drive/commons';

import {
    ChunkUploadBody,
    ChunkUploadBodySchema
} from '@models/upload.model';

export const handleInitUpload = (req: Request, res: Response): void => {
    const fileId = crypto.randomUUID();
    const responseData: InitUploadReponse = {
        "fileId": fileId
    }
    res.status(200).json(responseData);
    return;
};


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
 * Middleware to ensure the request body is handled as a raw buffer.
 * MUST be applied to the specific route before the handler.
 */
export const rawBodyParser = express.raw({
    type: 'application/octet-stream',
    limit: 2 * 10 ** 6,
});

function validateChunkHeader(headers: Request['headers']) {
    try {
        return ChunkUploadHeadersSchema.parse(headers);
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.issues;
            logger.error('ZodError: ', {error: error});
            return null;
        } else {
            return null
        }
    }
}


/**
 * Handler for receiving and processing individual file chunks.
 */
export const handleChunkUpload = (req: Request, res: Response): void => {
    logger.info('run handleChunkUpload');
    // 1. Validate and extract required headers
    const headers: ChunkUploadHeaders | null = validateChunkHeader(req.headers);

    if (!headers) {
        logger.info('header undefined');
        res.sendStatus(405);
        return;
    }

    // 2. Validate body type (Express.js provides the body as a Buffer)
    const chunk: ChunkUploadBody = ChunkUploadBodySchema.parse(req.body);
    if (!Buffer.isBuffer(chunk) || chunk.length === 0) {
        logger.info(`Chunk body failed, chunk length: ${chunk.length}`);
        res.status(400).send({ message: 'Request body must contain binary data.' });
        return;
    }

    res.sendStatus(200);
    return;
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