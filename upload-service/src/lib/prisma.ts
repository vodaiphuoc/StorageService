import { PrismaClient } from '@generated-prisma/client';
import { File, Chunk } from '@generated-prisma/client';

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
            DBService.singleton = new DBService();
        }

        return DBService.singleton;
    };

    public async createFile(file: File) {
        return await this.prismaClient.file.create({ data: file });
    }

    public async createChunk(chunk: Chunk) {
        return await this.prismaClient.chunk.create({ data: chunk });
    }


}