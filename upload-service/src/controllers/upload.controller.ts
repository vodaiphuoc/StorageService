import { type Request, type Response } from 'express';
import express from 'express';

import * as fs from 'fs';
import * as path from 'path';
import type { ChunkUploadHeaders, ChunkUploadBody } from '@clone-google-drive/commons';

// Use a temporary directory for storing chunks
const TEMP_DIR = path.join(process.cwd(), 'temp_uploads');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Middleware to ensure the request body is handled as a raw buffer.
 * MUST be applied to the specific route before the handler.
 */
export const rawBodyParser = express.raw({
    type: '*/*', // Accept any content type, though Angular sends 'application/octet-stream'
    limit: '5mb', // Set max size equal to your Angular chunk size
});

/**
 * Handler for receiving and processing individual file chunks.
 */
export const handleChunkUpload = (req: Request, res: Response): void => {
    // 1. Validate and extract required headers
    console.log('server log header:',req.headers);
    const headers: ChunkUploadHeaders = req.headers as unknown as ChunkUploadHeaders;
    const chunkIndex = parseInt(headers['Chunk-Index'], 10);
    const fileId = headers['File-Id'];

    if (!fileId || !headers['Content-Range']) {
        res.status(400).send({ message: 'Missing required headers (File-ID or Content-Range).' });
        return;
    }

    // 2. Validate body type (Express.js provides the body as a Buffer)
    const chunk: ChunkUploadBody = req.body;
    if (!Buffer.isBuffer(chunk) || chunk.length === 0) {
        res.status(400).send({ message: 'Request body must contain binary data.' });
        return;
    }

    // 3. Define the path for the temporary chunk file
    const tempFilePath = path.join(TEMP_DIR, `${fileId}_chunk_${chunkIndex}`);

    // 4. Write the chunk data to a temporary file
    try {
        // In a real implementation, you'd check file existence and integrity
        fs.writeFileSync(tempFilePath, chunk);
        
        // 5. Respond successfully
        res.status(200).send({ 
            chunkIndex: chunkIndex, 
            message: `Chunk ${chunkIndex} received for file ${fileId}.` 
        });
    } catch (error) {
        console.error('File write error:', error);
        res.status(500).send({ message: 'Failed to write chunk to disk.' });
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