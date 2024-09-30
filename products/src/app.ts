import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@share-package/common';
import { categoriesRouter } from './routes/categories.routes';
import { suplierRouter } from './routes/suplier.routes';
import { productRouter } from './routes/product.routes';

const app = express();
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
app.use(categoriesRouter);
app.use(suplierRouter);
app.use(productRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError('Route');
});
app.use(errorHandler);
export { app };
