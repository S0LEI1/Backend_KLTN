import express, { Request, Response } from 'express';
import { currentUser } from '@share-package/common';
const router = express.Router();

router.get('/permissions/', (req: Request, res: Response) => {
  res.send({
    message: 'Hello',
  });
});

export { router as indexRouter };
