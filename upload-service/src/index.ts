import 'module-alias/register';
import express from 'express';
import type { Express, Request,Response } from 'express';
import uploadRouter from '@routes/upload.route'; 
import * as dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const HOST = '0.0.0.0';
const PORT = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express with TypeScript!');
});

app.use(express.json()); 
app.use('/api/upload', uploadRouter); 


app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('API is running.');
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT} with host: ${HOST}`);
});

