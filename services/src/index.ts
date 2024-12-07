import mongoose from 'mongoose';
import { app, httpServer } from './app';
import { natsWrapper } from './nats-wrapper';
import { Socket, Server } from 'socket.io';
import { init } from './socket';
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
  if (!process.env.BUCKET_NAME) {
    throw new Error('Bucket name must be defined');
  }
  if (!process.env.ACCESS_KEY_ID) {
    throw new Error('Access key Id must be defined');
  }
  if (!process.env.SECRET_ACCESS_KEY) {
    throw new Error('Secret access key name must be defined');
  }
  if (!process.env.REGION) {
    throw new Error('Region name must be defined');
  }
  if (!process.env.PER_PAGE) {
    throw new Error('Per page name must be defined');
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

    mongoose
      .connect(process.env.MONGO_URI)
      .then((result) => {
        console.log('Connecting mongo!!');
        const server = httpServer.listen(3000, () => {
          console.log('Listening on port 3000');
        });
        const io = init(server);
        io.on('connection', (socket: Socket) => {
          console.log('Client connected', socket.id);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};

// start db mongo
start();
