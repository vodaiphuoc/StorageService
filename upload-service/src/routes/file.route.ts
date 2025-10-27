import * as express from 'express';
import {
    handlViewFileContent
} from '@controllers/file.controller';

import {
    verifyViewFileHeader
} from '@middlewares/file.middleware';

const fileRouter = express.Router();

fileRouter.get('/view', verifyViewFileHeader, handlViewFileContent);

export default fileRouter;