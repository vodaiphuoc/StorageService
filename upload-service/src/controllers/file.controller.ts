import { Request, Response } from 'express';
import * as z from "zod";
import { ViewAllFileIdHeader , ViewFileHeader, FileModelResponse, FileModelSchema } from '@clone-google-drive/commons';
import { MinioService } from '@clone-google-drive/shared-clients';
import { FileModel } from '@generated-prisma/models/File';
import { DBService } from '@lib/prisma';

import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);


function formatDatetime(inputDate: Date): string {
    const year = inputDate.getUTCFullYear();
    const month = inputDate.getUTCMonth() + 1; 
    const day = inputDate.getUTCDate();
    const pad = (num: number) => num.toString().padStart(2, '0');

    // Concatenate into YYYY-MM-DD format
    return `${year}-${pad(month)}-${pad(day)}-12`;
}

export const handleGetAllFileId = async (req: Request, res: Response) => {
    try {
        const headers: ViewAllFileIdHeader = req.headers as ViewAllFileIdHeader;    

        const dbService: DBService = DBService.getInstance();
        const files: FileModel[] | undefined = await dbService.getAllFileIds(headers['user-id']);

        if (files) {
            const responseData: FileModelResponse[] = files.map((file: FileModel) => {
                const itemType: "file"|"folder"|"image" =
                        file.folderPath ? "folder"
                        : file.mimeType.startsWith("image") ? "image"
                        : "file"
                
                const repsoneItem = {
                    id: file.id,
                    fileName: file.fileName,
                    itemType: itemType,
                    createAt: formatDatetime(file.createdAt)
                }
                
                return FileModelSchema.parse(repsoneItem);
            })
            return res.status(200).json(responseData);
        } else {
            logger.error(`Undefine files retrieval for user:  ${headers['user-id']}`);
            return res.status(404).json({ 
                message: "Cannot get content"
            });
        }
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.error(`handleGetAllFileId error: ${error}`);
            return res.status(404).json({ 
                message: "Cannot get content, internal server error"
            });
        } else {
            logger.error(`handleGetAllFileId error: ${error}`);
            return res.status(500).json({ 
                message: "Internal server error"
            });
        }
        
    }
    

}


export const handlViewFileContent = async (req: Request, res: Response) => {
    try {
        const headers: ViewFileHeader = req.headers as ViewFileHeader;
        const minioSevice = MinioService.getInstance();

        const dbService: DBService = DBService.getInstance();
        const file = await dbService.getFile(headers['user-id'], headers['file-id']);

        if (file) {
            const stream = await minioSevice.getObjectStream(file.id);
            res.setHeader('Content-Type', 'application/octet-stream');
            stream.pipe(res);
            return;

        } else {
            logger.error(`Undefine files retrieval for user:  ${headers['user-id']}, file: ${headers['file-id']}`);
            return res.status(404).json({
                message: "Cannot get content"
            });
        }
        
    } catch (error) {
        logger.error(`Init upload field ${error}`);
        return res.status(500).json({ 
            message: "Internal server error"
        });
    }
};