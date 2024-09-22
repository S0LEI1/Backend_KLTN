import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@share-package/common';
import { verifyRouter } from './routes/verify-otp';
import { updatePasswordRouter } from './routes/update-password';
import { sendOtpRouter } from './routes/send-otp';
import { addUserURMRouter } from './routes/add-roles/add';
import { deleteUserURM } from './routes/add-roles/delete';

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
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(verifyRouter);
app.use(updatePasswordRouter);
app.use(sendOtpRouter);
app.use(addUserURMRouter);
app.use(deleteUserURM);
app.all('*', async (req, res) => {
  throw new NotFoundError('Route');
});
app.use(errorHandler);
export { app };
