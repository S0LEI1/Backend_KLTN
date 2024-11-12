import { BadRequestError, NotFoundError } from '@share-package/common';
import { OrderDoc } from '../models/order';
import { OrderProduct, OrderProductDoc } from '../models/order-product';
import { ProductDoc } from '../models/product';
import { Attrs } from './order.service';
import { ProductService } from './product.service';

export class OrderProductService {
  static async newOrderProduct(order: OrderDoc, attr: Attrs) {
    const orderProdctExist = await OrderProduct.findOne({
      order: order.id,
      product: attr.id,
      isDeleted: false,
    });
    if (!orderProdctExist) throw new BadRequestError('Order-Product exist');
    const { product, price } = await ProductService.getProduct(attr);
    const orderProduct = OrderProduct.build({
      order: order,
      product: product,
      quantity: attr.quantity,
      totalPrice: price,
    });
    await orderProduct.save();
    return orderProduct;
  }
  static async newOrderProducts(order: OrderDoc, productAttrs: Attrs[]) {
    const orderProducts: OrderProductDoc[] = [];
    let productTotalPrice: number = 0;
    for (const attr of productAttrs) {
      const orderProduct = await this.newOrderProduct(order, attr);
      orderProducts.push(orderProduct);
      productTotalPrice += orderProduct.totalPrice;
    }
    return { orderProducts, productTotalPrice };
  }
  static async updateOrderProduct(order: OrderDoc, productAttrs: Attrs[]) {
    const orderProducts: OrderProductDoc[] = [];
    const orderProductExist = await OrderProduct.find({
      order: order.id,
      isDeleted: false,
    });
    const productExistIds = orderProductExist.map((od) => od.product._id);
    const productIds: string[] = productAttrs.map((pro) => pro.id);
    // const difference = productExistIds.filter(
    //   (element) => !productIds.includes(element)
    // );
    console.log('productExistIds', productExistIds);

    console.log('productIds', productIds);

    // console.log('difference', difference);

    let productTotalPrice: number = 0;
    let { preTaxTotal } = order;
    for (const attr of productAttrs) {
      const orderProduct = await OrderProduct.findOne({
        order: order.id,
        product: attr.id,
      }).populate('product');
      if (!orderProduct) {
        const orderProduct = await this.newOrderProduct(order, attr);
        preTaxTotal += orderProduct.totalPrice;
        orderProducts.push(orderProduct);
        console.log('new product');
        continue;
      }
      const quantity = orderProduct.quantity - attr.quantity;
      let { totalPrice } = orderProduct;
      if (quantity === 0) continue;
      if (quantity === orderProduct.quantity)
        orderProduct!.set({ isDeleted: false });
      if (quantity < 0) {
        totalPrice +=
          (attr.quantity - orderProduct.quantity) *
          orderProduct.product.salePrice;
      }
      if (quantity > 0) {
        totalPrice -= quantity * orderProduct.product.salePrice;
      }
      orderProduct.set({ quantity: attr.quantity, totalPrice: totalPrice });
      await orderProduct.save();
      orderProducts.push(orderProduct);
      productTotalPrice -= orderProduct.totalPrice;
    }
    return { orderProducts, productTotalPrice };
  }
  static async findByOrderId(orderDoc: OrderDoc) {
    const orderProducts = await OrderProduct.aggregate([
      { $match: { order: orderDoc._id } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
    ]);
    return orderProducts;
  }
}
