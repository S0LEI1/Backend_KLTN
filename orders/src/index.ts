import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { CategoryCreatedListener } from './events/listeners/categories/category-created-listener';
import { CategoryUpdatedListener } from './events/listeners/categories/category-updated-listener';
import { CategoryDeletedListener } from './events/listeners/categories/category-deleted-listener';
import { SuplierCreatedListener } from './events/listeners/supliers/suplier-created-listener';
import { SuplierUpdatedListener } from './events/listeners/supliers/suplier-updated-listener';
import { SuplierDeletedListener } from './events/listeners/supliers/suplier-deleted-listener';
import { ProductCreatedListener } from './events/listeners/products/product-created-listener';
import { ProductUpdatedListener } from './events/listeners/products/product-updated-listener';
import { ProductDeletedListener } from './events/listeners/products/product-deleted-listener';
import { UserCreatedListener } from './events/listeners/users/user-created-listener';
import { UserUpdatedListener } from './events/listeners/users/user-updated-listener';
import { UserDeletedListener } from './events/listeners/users/user-deleted-listener';
import { ServiceCreatedListener } from './events/listeners/services/service-created-listener';
import { ServiceUpdatedListener } from './events/listeners/services/service-updated-listener';
import { ServiceDeletedListener } from './events/listeners/services/service-deleted-listener';
import { PackageCreatedListener } from './events/listeners/packages/package-created-listener';
import { PackageDeletedListener } from './events/listeners/packages/package-deleted-listener';
import { PackageServiceCreatedListener } from './events/listeners/package-services/package-service-created-listener';
import { PacakgeServiceDeletedListener } from './events/listeners/package-services/package-service-deleted-listener';
import { PackageUpdatedListener } from './events/listeners/packages/package-updated-listener';
import { PackageServiceUpdatedListener } from './events/listeners/package-services/package-service-updated-listener';
import { PaymentCreatedListener } from './events/payments/payment-created-listener';

const start = async () => {
  console.log('starting');

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
    new CategoryCreatedListener(natsWrapper.client).listen();
    new CategoryUpdatedListener(natsWrapper.client).listen();
    new CategoryDeletedListener(natsWrapper.client).listen();
    // ------------------suplier --------------------------
    new SuplierCreatedListener(natsWrapper.client).listen();
    new SuplierUpdatedListener(natsWrapper.client).listen();
    new SuplierDeletedListener(natsWrapper.client).listen();
    // ------------------product --------------------------
    new ProductCreatedListener(natsWrapper.client).listen();
    new ProductUpdatedListener(natsWrapper.client).listen();
    new ProductDeletedListener(natsWrapper.client).listen();
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
    // ------------------package service --------------------------
    new PackageServiceCreatedListener(natsWrapper.client).listen();
    new PacakgeServiceDeletedListener(natsWrapper.client).listen();
    new PackageServiceUpdatedListener(natsWrapper.client).listen();
    // --------------------payment-----------------------------------
    new PaymentCreatedListener(natsWrapper.client).listen();
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
