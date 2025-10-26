import { PrismaClient } from '@generated-prisma/client';
import { ChunkModel } from '@generated-prisma/models/Chunk';
import { FileModel } from '@generated-prisma/models/File';
import { getLogger } from '@utils/logger';
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

    public async createChunk(chunk: ChunkModel) {
        return await this.prismaClient.chunk.create({ data: chunk });
    }


}