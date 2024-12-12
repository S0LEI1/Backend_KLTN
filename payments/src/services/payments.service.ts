import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  PaymentType,
  UserType,
} from '@share-package/common';
import { Order, OrderDoc } from '../models/order';
import { Request, Response } from 'express';
import axios from 'axios';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-listener';
import { natsWrapper } from '../nats-wrapper';
import { Payment } from '../models/payment';
const callback = process.env.NGROK_LINK!;
export class PaymentServices {
  static async payment(
    cusId: string,
    orderId: string,
    type: string,
    userType: string
  ) {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) throw new NotFoundError('Order');
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError('Cannot pay for an cancelled order');
    if (order.status === OrderStatus.Complete)
      throw new BadRequestError('Cannot pay for an complete order');
    if (order.status === OrderStatus.CashPayment)
      throw new BadRequestError('Cannot pay for an cash payment order');
    if (
      (userType === UserType.Employee || userType === UserType.Manager) &&
      type === PaymentType.Cash
    ) {
      const result = await this.cashPayment(order);
      return result;
    }
    if (cusId != order.customer)
      throw new BadRequestError('You not own this order,can not payment');
    if (type !== PaymentType.Cash && type !== PaymentType.Online)
      throw new BadRequestError('Payment type not valid');
    if (type === PaymentType.Online) {
      const result = await this.onlinePayment(order);
      return result;
    }
    if (type === PaymentType.Cash) {
      const result = await this.cashPayment(order);
      return result;
    }
  }
  static async onlinePayment(order: OrderDoc) {
    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var orderInfo = 'Pay with MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = '';
    var ipnUrl = `www.kimbeautyspa.store/payments/callback`;
    var requestType = 'payWithMethod';
    var amount = order.postTaxTotal;
    var orderId = order.id + new Date().getTime();
    var requestId = order.id;
    var extraData = '';
    var paymentCode =
      'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
    var orderGroupId = '';
    var autoCapture = true;
    var lang = 'vi';
    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;
    //puts raw signature
    console.log('--------------------RAW SIGNATURE----------------');
    console.log(rawSignature);
    //signature
    const crypto = require('crypto');
    var signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    console.log('--------------------SIGNATURE----------------');
    console.log(signature);

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });
    //Create the HTTPS objects
    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/create',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };
    let result;
    try {
      result = await axios(options);
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }
  static async cashPayment(order: OrderDoc) {
    const payment = Payment.build({
      orderId: order.id,
      type: PaymentType.Cash,
    });
    await payment.save();
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      paymentId: payment.id,
      type: payment.type,
      orderId: order.id,
    });
    return order.id;
  }
}
