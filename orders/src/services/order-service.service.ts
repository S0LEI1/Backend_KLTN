import { OrderDoc } from '../models/order';
import { OrderServiceM, OrderServiceDoc } from '../models/order-service';
import { Attrs } from './order.service';
import { ServiceService } from './service.service';

export class OrderServiceService {
  static async newOrderService(order: OrderDoc, servicesAttr: Attrs[]) {
    const orderServices: OrderServiceDoc[] = [];
    let serviceTotalPrice: number = 0;
    for (const attr of servicesAttr) {
      const { service, price } = await ServiceService.getService(attr);
      const orderSrv = OrderServiceM.build({
        order: order,
        service: service,
        quantity: attr.quantity,
        totalPrice: price,
      });
      await orderSrv.save();
      orderServices.push(orderSrv);
      serviceTotalPrice += price;
    }
    return { orderServices, serviceTotalPrice };
  }
}
