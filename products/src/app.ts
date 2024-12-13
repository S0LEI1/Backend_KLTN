import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { createServer } from 'http';
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@share-package/common';
import { categoriesRouter } from './routes/categories.routes';
import { suplierRouter } from './routes/suplier.routes';
import { productRouter } from './routes/product.routes';

const app = express();
const httpServer = createServer(app);
app.use(json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', true);
// config cookie session
app.use(
  cookieSession({
    signed: false,
    secure: false,
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
app.use(categoriesRouter);
app.use(suplierRouter);
app.use(productRouter);
app.all('*', async (req, res) => {
  throw new NotFoundError('Route');
});
app.use(errorHandler);
export { app, httpServer };
