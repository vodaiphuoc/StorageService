import * as express from 'express';
import {
    handleGetAllFileId,
    handlViewFileContent,
    handleGetFilesId
} from '@controllers/file.controller';

import {
    verifyViewAllFileIdHeader,
    verifyViewFileHeader,
    verifyViewFileIdBody
} from '@middlewares/file.middleware';

const fileRouter = express.Router();

fileRouter.get('/allFileMeta', verifyViewAllFileIdHeader, handleGetAllFileId);
fileRouter.post(
    '/filesMeta',
    express.json(),
    verifyViewAllFileIdHeader,
    verifyViewFileIdBody,
    handleGetFilesId
);
fileRouter.get('/fileView', verifyViewFileHeader, handlViewFileContent);

export default fileRouter;