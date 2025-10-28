import * as z from "zod";
import { Request, Response, NextFunction } from 'express';

import {
    ChunkUploadHeadersSchema,
    InitUploadHeadersSchema,
    InitUploadBodySchema
} from '@clone-google-drive/commons';

import {
    completeUploadHeadersSchema,
    completeUploadBodySchema
} from '@clone-google-drive/commons';


import { getLogger } from '@utils/logger';

console.log(__filename);
const logger = getLogger(__filename);

export const validateInitUploadHeader = (req: Request, res: Response, next: NextFunction): void => {
    try {
        InitUploadHeadersSchema.parse(req.headers);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Log the detailed validation error
            logger.error(`ZodError: ${error}`);
            
            // Bad Request
            res.status(400).send({
                message: "Validation Failed",
                details: error.issues
            });
        } else {
            logger.error(`Unexpected Error in Header Validation: ${error}`);
            res.sendStatus(500);
        }
    }
};

export const validateInitUploadBody = (req: Request, res: Response, next: NextFunction): void => {
    try {
        InitUploadBodySchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.error(`ZodError: ${error}`);
            
            // Bad Request
            res.status(400).send({
                message: "Validation Failed",
                details: error.issues
            });
        } else {
            // Log any other unexpected error
            logger.error(`Unexpected Error in Body Validation: ${error}`);
            
            // Send a generic 500 Internal Server Error
            res.sendStatus(500);
        }
    }
};




export const validateChunkHeader = (req: Request, res: Response, next: NextFunction): void => {
    try {
        ChunkUploadHeadersSchema.parse(req.headers);
        next();

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Log the detailed validation error
            logger.error(`ZodError: ${error}`);

            // Bad Request
            res.status(400).send({
                message: "Validation Failed",
                details: error.issues
            });
        } else {
            logger.error(`Unexpected Error in Header Validation: ${error}`);
            res.sendStatus(500);
        }
    }
};


export const validateCompleteUploadHeader = (req: Request, res: Response, next: NextFunction): void => {
    try {
        completeUploadHeadersSchema.parse(req.headers);
        next();

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Log the detailed validation error
            logger.error(`ZodError: ${error}`);

            // Bad Request
            res.status(400).send({
                message: "Validation Failed",
                details: error.issues
            });
        } else {
            logger.error(`Unexpected Error in Header Validation: ${error}`);
            res.sendStatus(500);
        }
    }
};


export const validateCompleteUploadBody = (req: Request, res: Response, next: NextFunction): void => {
    try {
        completeUploadBodySchema.parse(req.body);
        next();

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Log the detailed validation error
            logger.error(`ZodError: ${error}`);

            // Bad Request
            res.status(400).send({
                message: "Validation Failed",
                details: error.issues
            });
        } else {
            logger.error(`Unexpected Error in Body Validation: ${error}`);
            res.sendStatus(500);
        }
    }
};