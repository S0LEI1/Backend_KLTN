import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import bodyParser from 'body-parser';
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
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', true);
// config cookie session
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != 'test',
  })
);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
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
