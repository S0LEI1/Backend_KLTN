import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@share-package/common';
import { profileRouter } from './routes/profiles.routes';
import { accountRouter } from './routes/account.routes';
import { mailRouter } from './routes/mail.routes';
import { managerRouter } from './routes/manager.routes';

const app = express();
app.use(json());
app.set('trust proxy', true);

// config cookie session
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != 'test',
  })
);

app.use(cors());
app.use(currentUser);
app.use(profileRouter);
app.use(accountRouter);
app.use(mailRouter);
app.use(managerRouter);
app.all('*', async (req, res) => {
  throw new NotFoundError('Route');
});
app.use(errorHandler);
export { app };
