import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';
interface Payload {
  id: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  const publisher = new ExpirationCompletePublisher(natsWrapper.client).publish(
    {
      id: job.data.id,
    }
  );
  console.log(
    'I want publish an expiration:complete event for orderId',
    job.data.id
  );
});

export { expirationQueue };
