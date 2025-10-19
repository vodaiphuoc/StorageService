import 'module-alias/register';
import express from 'express';
import type { Express, Response } from 'express';
import uploadRouter from '@routes/upload.route'; 
import * as dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (res: Response) => {
    res.send('Hello from Express with TypeScript!');
});

app.use(express.json()); 
app.use('/upload', uploadRouter); 


// Basic health check route
app.get('/', (res: Response) => {
    res.send('API is running.');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


