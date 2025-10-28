import { PrismaClient } from '@generated-prisma/client';
import { FileModel } from '@generated-prisma/models/File';
import { Status } from '@generated-prisma/client';
import { getLogger } from '@utils/logger';

import {
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
    PrismaClientValidationError
} from '@generated-prisma/internal/prismaNamespace';

const logger = getLogger(__filename);


export class DBService {
    private static singleton: DBService;
    private prismaClient: PrismaClient;

    private constructor() { 
        this.prismaClient = new PrismaClient({
            log: ['query', 'info', 'error']
        });
    };

    public static getInstance() {
        if (!DBService.singleton) {
            logger.info("init DBService");
            DBService.singleton = new DBService();
        }

        return DBService.singleton;
    };

    public async createFile(file: FileModel) {
        return await this.prismaClient.file.create({ data: file });
    }

    public async updateUploadStatus(
        fileId: string,
        userId: string,
        newStatus: Status
    ) {
        await this.prismaClient.file.update({
            where: {
                id: fileId,
                userId: userId
            },
            data: {
                uploadStatus: newStatus
            }
        })
    }


    /**
     * Get list of fileId of the user
     * @param userId 
     * @returns 
     */
    public async getAllFileIds(userId: string) {
        const userRecord = await this.prismaClient.user.findUnique({
            where: {
                id: userId
            },
            include: {
                file: true
            }
        });

        return userRecord?.file
    }

    /**
     * Get sepecific file
     * @param userId 
     * @param fileId 
     * @returns 
     */
    public async getFile(userId: string,fileId: string) {
        return await this.prismaClient.file.findUnique({
            where: {
                id: fileId,
                userId: userId
            }
        });
    }


}