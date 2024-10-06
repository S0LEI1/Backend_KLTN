import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@share-package/common';
// import { indexPerRouter } from './routes/permissions';
// import { newPerIndex } from './routes/permissions/new';
// import { updatePermissionRouter } from './routes/permissions/update';
// import { deletePermissionRouter } from './routes/permissions/disable';
import { indexRolesRouter } from './routes/roles';
import { addRolePermissionRouter } from './routes/role-permission/add';
import { deleteRolePermissionRouter } from './routes/role-permission/remove';
import { roleRouter } from './routes/role.routes';

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
app.use(roleRouter);
app.use(indexRolesRouter);
// app.use(updateRoleRouter);
// app.use(deleteRoleRouter);
// role permission
app.use(addRolePermissionRouter);
app.use(deleteRolePermissionRouter);
app.all('*', async (req, res) => {
  throw new NotFoundError('Route');
});
app.use(errorHandler);
export { app };
