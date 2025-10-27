import * as z from "zod";
import { Request, Response, NextFunction } from 'express';

import { ViewFileHeaderSchema } from '@clone-google-drive/commons';


import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);


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
