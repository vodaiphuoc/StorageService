import * as express from 'express';
import {
    handleGetAllFileId,
    handlViewFileContent
} from '@controllers/file.controller';

import {
    verifyViewAllFileIdHeader,
    verifyViewFileHeader
} from '@middlewares/file.middleware';

const fileRouter = express.Router();

fileRouter.get('/filelist', verifyViewAllFileIdHeader, handleGetAllFileId);
fileRouter.get('/fileview', verifyViewFileHeader, handlViewFileContent);

export default fileRouter;