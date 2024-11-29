import { PaymentType } from '@share-package/common';
import mongoose from 'mongoose';

interface PaymentAttrs {
  orderId: string;
  type: PaymentType;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  type: PaymentType;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    type: {
      required: true,
      type: String,
      enum: PaymentType,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
);

export { Payment };
