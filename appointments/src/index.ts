import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { BranchCreatedListener } from './events/listeners/branchs/branch-created-listener';
import { BranchUpdatedListener } from './events/listeners/branchs/branch-updated-listener';
import { BranchDeletedListener } from './events/listeners/branchs/branch-delete-listener';
import { UserCreatedListener } from './events/listeners/users/user-created-listener';
import { UserUpdatedListener } from './events/listeners/users/user-updated-listener';
import { UserDeletedListener } from './events/listeners/users/user-deleted-listener';
import { ServiceCreatedListener } from './events/listeners/services/service-created-listener';
import { ServiceUpdatedListener } from './events/listeners/services/service-updated-listener';
import { ServiceDeletedListener } from './events/listeners/services/service-deleted-listener';
import { PackageCreatedListener } from './events/listeners/packages/package-created-listener';
import { PackageUpdatedListener } from './events/listeners/packages/package-updated-listener';
import { PackageDeletedListener } from './events/listeners/packages/package-deleted-listener';
import { OrderCreatedListener } from './events/listeners/orders/order-created-listener';
import { OrderUpdatedListener } from './events/listeners/orders/order-updated-listener';
import { OrderDeletedListener } from './events/listeners/orders/order-deleted-listener';
import { OrderServiceCreatedListener } from './events/listeners/order-service/order-service-created-listener';
import { OrderServiceUpdatedListener } from './events/listeners/order-service/order-service-updated-listener';
import { OrderServiceDeletedListener } from './events/listeners/order-service/order-service-deleted-listener';
import { OrderPackageCreatedListener } from './events/listeners/order-package/order-package-created-listener';
import { OrderPackageUpdatedListener } from './events/listeners/order-package/order-package-updated-listener';
import { OrderPackageDeletedListener } from './events/listeners/order-package/order-package-deleted-listener';
const start = async () => {
  console.log('starting................');
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

    new BranchCreatedListener(natsWrapper.client).listen();
    new BranchUpdatedListener(natsWrapper.client).listen();
    new BranchDeletedListener(natsWrapper.client).listen();
    // ------------------users --------------------------
    new UserCreatedListener(natsWrapper.client).listen();
    new UserUpdatedListener(natsWrapper.client).listen();
    new UserDeletedListener(natsWrapper.client).listen();
    // ------------------services --------------------------
    new ServiceCreatedListener(natsWrapper.client).listen();
    new ServiceUpdatedListener(natsWrapper.client).listen();
    new ServiceDeletedListener(natsWrapper.client).listen();
    // ------------------package --------------------------
    new PackageCreatedListener(natsWrapper.client).listen();
    new PackageUpdatedListener(natsWrapper.client).listen();
    new PackageDeletedListener(natsWrapper.client).listen();
    // ------------------order --------------------------
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderUpdatedListener(natsWrapper.client).listen();
    new OrderDeletedListener(natsWrapper.client).listen();
    // ------------------order-service--------------------------
    new OrderServiceCreatedListener(natsWrapper.client).listen();
    new OrderServiceUpdatedListener(natsWrapper.client).listen();
    new OrderServiceDeletedListener(natsWrapper.client).listen();
    // ------------------order-package --------------------------
    new OrderPackageCreatedListener(natsWrapper.client).listen();
    new OrderPackageUpdatedListener(natsWrapper.client).listen();
    new OrderPackageDeletedListener(natsWrapper.client).listen();
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
