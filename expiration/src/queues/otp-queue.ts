import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';
import { ExpirationName } from './expiration-name';
interface Payload {
  id: string;
  otp: string;
}

const otpQueue = new Queue<Payload>(ExpirationName.OtpCreated, {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// expirationUserQueue.process(async (job) => {
//   const publisher = new ExpirationCompletePublisher(natsWrapper.client).publish(
//     {
//       id: job.data.id,
//       otp: job.data.otp
//     }
//   );
//   console.log(
//     `I want publish an expiration:complete event for ${ExpirationName.UserCreated}`,
//     job.data.id
//   );
// });

export { otpQueue };
