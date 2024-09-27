import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { signupRouter } from './routes/signup';
import { verifyRouter } from './routes/verify-otp';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@share-package/common';
import { updatePasswordRouter } from './routes/update-password';
import { sendOtpRouter } from './routes/send-otp';

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
// app.use(currentUser);
app.use(signupRouter);
app.use(verifyRouter);
app.use(updatePasswordRouter);
app.use(sendOtpRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError('Route');
});
app.use(errorHandler);
export { app };
