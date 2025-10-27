import { Request, Response } from 'express';

import { ViewFileHeader } from '@clone-google-drive/commons';
import { MinioService } from '@clone-google-drive/shared-clients';

import { DBService } from '@lib/prisma';


export const handlViewFileContent = (req: Request, res: Response): void => {
    const headers: ViewFileHeader = req.headers as ViewFileHeader;    
    const minioSevice = MinioService.getInstance();

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


    // res.status(200).json(responseData);
    return;
};