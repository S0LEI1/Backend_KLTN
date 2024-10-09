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
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
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
