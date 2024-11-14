import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@share-package/common';
import { servicesRouter } from './routes/services.routes';
import { packageRouter } from './routes/package.routes';
import { packageServiceRouter } from './routes/package-service.routes';

const app = express();
const httpServer = createServer(app);
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
app.use(servicesRouter);
app.use(packageRouter);
app.use(packageServiceRouter);
app.all('*', async (req, res) => {
  throw new NotFoundError('Route');
});
app.use(errorHandler);
export { app, httpServer };
