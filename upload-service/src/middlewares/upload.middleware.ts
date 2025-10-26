import * as z from "zod";
import { Request, Response, NextFunction } from 'express';

import {
    ChunkUploadHeadersSchema,
    InitUploadHeadersSchema,
    InitUploadBodySchema
} from '@clone-google-drive/commons';

import { getLogger } from '@utils/logger';


const logger = getLogger(__filename);

export const validateInitUploadHeader = (req: Request, res: Response, next: NextFunction): void => {
    try {
        InitUploadHeadersSchema.parse(req.headers);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Log the detailed validation error
            logger.error('ZodError:', { error: error.issues }); 
            
            // Bad Request
            res.status(400).send({
                message: "Validation Failed",
                details: error.issues
            });
        } else {
            logger.error('Unexpected Error in Header Validation:', { error: error });
            res.sendStatus(500); 
        }
    }
}

export const validateInitUploadBody = (req: Request, res: Response, next: NextFunction): void => {
    try {
        InitUploadBodySchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.error('ZodError:', { error: error.issues }); 
            
            // Bad Request
            res.status(400).send({
                message: "Validation Failed",
                details: error.issues
            });
        } else {
            // Log any other unexpected error
            logger.error('Unexpected Error in Header Validation:', { error: error });
            
            // Send a generic 500 Internal Server Error
            res.sendStatus(500); 
        }
    }
}




export const validateChunkHeader = (req: Request, res: Response, next: NextFunction): void => {
    try {
        ChunkUploadHeadersSchema.parse(req.headers);
        next();

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Log the detailed validation error
            logger.error('ZodError:', { error: error.issues }); 

            // Bad Request
            res.status(400).send({
                message: "Validation Failed",
                details: error.issues
            });
        } else {
            logger.error('Unexpected Error in Header Validation:', { error: error });
            res.sendStatus(500); 
        }
    }
}
