import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { signinRouter } from './routes/auth/signin';
import { signoutRouter } from './routes/auth/signout';
import {
  BadRequestError,
  currentUser,
  errorHandler,
  NotFoundError,
} from '@share-package/common';
import { accountRoleRouter } from './routes/rules/account-role.routes';
import { permissionRouter } from './routes/rules/permission.routes';
import { roleRouter } from './routes/rules/role.routes';
import { rolePermissionRouter } from './routes/rules/role-permission.routes';
import { managerRouter } from './routes/users/manager.routes';
import { profileRouter } from './routes/users/profiles.routes';
import { authRouter } from './routes/auth/account.routes';

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
app.use(managerRouter);
app.use(profileRouter);
app.use(authRouter);
app.all('*', async (req, res) => {
  throw new BadRequestError('Route must be define');
});
app.use(errorHandler);
export { app };
