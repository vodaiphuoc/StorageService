import { Request, Response } from 'express';
import * as z from "zod";
import * as winston from 'winston';

import { ViewFileHeaderSchema, ViewFileHeader } from '@clone-google-drive/commons';
import { MinioService } from '@clone-google-drive/shared-clients';


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


function verifyViewFileHeader(headers: Request['headers']): ViewFileHeader|null {
    try {
        return ViewFileHeaderSchema.parse(headers);
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
    

export const handlViewFileContent = (req: Request, res: Response): void => {
    const headers = verifyViewFileHeader(req.headers);

    if (!headers) {
        logger.info('header undefined');
        res.sendStatus(405);
        return;
    }

    const minioSevice = MinioService.getInstance();


    // res.status(200).json(responseData);
    return;
};