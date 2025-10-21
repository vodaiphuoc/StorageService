import * as express from 'express';
import {
    handleInitUpload,
    handleChunkUpload,
    finalizeUpload,
    rawBodyParser
} from '@controllers/upload.controller';

const uploadRouter = express.Router();

// Apply the rawBodyParser middleware ONLY to the chunk upload route
uploadRouter.post('/init', handleInitUpload);
uploadRouter.post('/chunk-upload', rawBodyParser, handleChunkUpload);
uploadRouter.post('/complete', express.json(), finalizeUpload);

export default uploadRouter;