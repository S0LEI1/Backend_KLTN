import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
// import { PermissionCreatedListener } from './events/listeners/permissions/permission-created-listener';
// import { PermissionUpdatedListener } from './events/listeners/permissions/permission-updated-listener';
// import { PermissionDeletedListener } from './events/listeners/permissions/permission-deleted-listener';
import { RoleCreatedListener } from './events/listeners/roles/role-created-listener';
import { RoleUpdatedListener } from './events/listeners/roles/role-updated-listener';
import { RoleDeletedListener } from './events/listeners/roles/role-deleted-listener';
import { RolePermissionCreatedListener } from './events/listeners/role-permission/role-permission-created-listener';
import { RolePermissionDeletedListener } from './events/listeners/role-permission/role-permission-deleted-listener';
import { AccountRoleCreatedListener } from './events/listeners/account-role/account-role-created-listener';
import { AccountCreatedListener } from './events/listeners/accounts/account-created-listener';
import { AccountUpdatedListener } from './events/listeners/accounts/account-updated-listener';
import { AccountRoleDeletedListener } from './events/listeners/account-role/account-role-deleted-listener';
import { AccountDeletedListener } from './events/listeners/accounts/account-deleted-listener';
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS client must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS cluster id must be defined');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('Nats connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client!.close());
    process.on('SIGTERM', () => natsWrapper.client!.close());
    // declare listenr

    // new PaymentCreatedListener(natsWrapper.client).listen();
    // new PermissionCreatedListener(natsWrapper.client).listen();
    // new PermissionUpdatedListener(natsWrapper.client).listen();
    // new PermissionDeletedListener(natsWrapper.client).listen();
    // role event
    new RoleCreatedListener(natsWrapper.client).listen();
    new RoleUpdatedListener(natsWrapper.client).listen();
    new RoleDeletedListener(natsWrapper.client).listen();
    // role-permission
    new RolePermissionCreatedListener(natsWrapper.client).listen();
    new RolePermissionDeletedListener(natsWrapper.client).listen();
    // user
    // ----------------account role
    new AccountRoleCreatedListener(natsWrapper.client).listen();
    new AccountRoleDeletedListener(natsWrapper.client).listen();
    // ----------------acount
    new AccountCreatedListener(natsWrapper.client).listen();
    new AccountUpdatedListener(natsWrapper.client).listen();
    new AccountDeletedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecting mongo!!');
  } catch (error) {
    console.log(error);
  }
};

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
// start db mongo
start();
