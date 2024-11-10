import { OrderDoc } from '../models/order';
import { OrderProduct, OrderProductDoc } from '../models/order-product';
import { ProductDoc } from '../models/product';
import { Attrs } from './order.service';
import { ProductService } from './product.service';

export class OrderProductService {
  static async newOrderProduct(order: OrderDoc, productAttrs: Attrs[]) {
    const orderProducts: OrderProductDoc[] = [];
    let productTotalPrice: number = 0;
    for (const attr of productAttrs) {
      const { product, price } = await ProductService.getProduct(attr);
      const orderProduct = OrderProduct.build({
        order: order,
        product: product,
        quantity: attr.quantity,
        totalPrice: price,
      });
      await orderProduct.save();
      orderProducts.push(orderProduct);
      productTotalPrice += price;
    }
    return { orderProducts, productTotalPrice };
  }
}
