import 'module-alias/register';
import express from 'express';
import type { Express, Request,Response } from 'express';
import uploadRouter from '@routes/upload.route'; 
import fileRouter from '@routes/file.route';

import * as dotenv from 'dotenv';
import * as path from 'path';

import { RabbitMQService, MinioService } from '@clone-google-drive/shared-clients';
import { DBService } from '@lib/prisma';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({path: envPath});

const app: Express = express();
const HOST = '0.0.0.0';
const PORT = process.env.PORT;

console.log('db uri:', process.env.DATABASE_URL);

// RabbitMQService.getInstance();
MinioService.getInstance(
    process.env.MINIO_ENDPOINT,
    process.env.MINIO_PORT,
    process.env.MINIO_SECURE === 'true',
    process.env.MINIO_BUCKET_NAME,
    process.env.ACCESSKEY,
    process.env.SECRETKEY
);

DBService.getInstance();

app.use(express.json());

app.use('/api/upload', uploadRouter); 
app.use('/api/file', fileRouter);

app.get('/health', (req: Request, res: Response) => {
    MinioService.getInstance();
    DBService.getInstance();
    res.status(200).send('API is running.');
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT} with host: ${HOST}`);
});

