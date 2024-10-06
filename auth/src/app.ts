import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import {
  BadRequestError,
  currentUser,
  errorHandler,
  NotFoundError,
} from '@share-package/common';
import { accountRoleRouter } from './routes/account-role.routes';
import { permissionRouter } from './routes/permission.routes';
import { roleRouter } from './routes/role.routes';
import { rolePermissionRouter } from './routes/role-permission.routes';

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
app.use(signinRouter);
app.use(signoutRouter);
app.use(accountRoleRouter);
app.use(permissionRouter);
app.use(roleRouter);
app.use(rolePermissionRouter);
app.all('*', async (req, res) => {
  throw new BadRequestError('Route must be define');
});
app.use(errorHandler);
export { app };
