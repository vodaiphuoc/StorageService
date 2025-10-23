import 'module-alias/register';
import express from 'express';
import type { Express, Request,Response } from 'express';
import uploadRouter from '@routes/upload.route'; 

import * as dotenv from 'dotenv';
import * as path from 'path';

import { RabbitMQService, MinioService } from '@clone-google-drive/shared-clients';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({path: envPath});

const app: Express = express();
const HOST = '0.0.0.0';
const PORT = process.env.PORT;

// RabbitMQService.getInstance();
// MinioService.getInstance();

app.use(express.json()); 

app.use('/api/upload', uploadRouter); 

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('API is running.');
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT} with host: ${HOST}`);
});

