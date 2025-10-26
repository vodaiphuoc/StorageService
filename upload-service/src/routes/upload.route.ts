import * as express from 'express';
import {
    handleInitUpload,
    handleChunkUpload,
    finalizeUpload,
    rawBodyParser
} from '@controllers/upload.controller';

import {
    validateInitUploadBody,
    validateInitUploadHeader,
    validateChunkHeader
} from '@middlewares/upload.middleware';

const uploadRouter = express.Router();

// Apply the rawBodyParser middleware ONLY to the chunk upload route
uploadRouter.post('/init', validateInitUploadHeader, validateInitUploadBody, handleInitUpload);
uploadRouter.post('/chunk-upload', rawBodyParser, validateChunkHeader, handleChunkUpload);
uploadRouter.post('/complete', express.json(), finalizeUpload);

export default uploadRouter;