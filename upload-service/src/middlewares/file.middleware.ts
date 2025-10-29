import * as z from "zod";
import { Request, Response, NextFunction } from 'express';

import { ViewFileHeaderSchema, ViewAllFileIdHeaderSchema, ViewFilesIdBodySchema } from '@clone-google-drive/commons';


import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);


export const verifyViewAllFileIdHeader = (req: Request, res: Response, next: NextFunction): void => {
    try {
        ViewAllFileIdHeaderSchema.parse(req.headers);
        next()
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

/**
 * Verify body of a POST request to get data of new upload file/folder
 * @param req 
 * @param res 
 * @param next 
 */
export const verifyViewFileIdBody = (req: Request, res: Response, next: NextFunction) => {
    try {
        ViewFilesIdBodySchema.parse(req.body);
        next()
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


export const verifyViewFileHeader = (req: Request, res: Response, next: NextFunction): void => {
    try {
        ViewFileHeaderSchema.parse(req.headers);
        next()
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
