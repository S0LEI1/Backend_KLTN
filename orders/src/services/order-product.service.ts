import { BadRequestError, NotFoundError } from '@share-package/common';
import { OrderDoc } from '../models/order';
import { OrderProduct, OrderProductDoc } from '../models/order-product';
import { ProductDoc } from '../models/product';
import { Attrs } from './order.service';
import { ProductService } from './product.service';
export interface ProductInOrder {
  productInfor: ProductDoc;
  quantity: number;
}
export class OrderProductService {
  static async newOrderProduct(order: OrderDoc, attr: Attrs) {
    const orderProductExist = await OrderProduct.findOne({
      order: order.id,
      product: attr.id,
      isDeleted: false,
    }).populate('product');
    const { product, price } = await ProductService.getProduct(attr);
    if (attr.quantity <= 0)
      throw new BadRequestError(
        'Product quantity must be greater than or equal  1'
      );
    if (attr.quantity > product.quantity)
      throw new BadRequestError(
        `Insufficient quantity of product: ${product.name}`
      );

    if (orderProductExist) {
      if (attr.quantity === 0) orderProductExist.set({ isDeleted: true });
      orderProductExist.set({ quantity: attr.quantity });
      await orderProductExist.save();
      return orderProductExist;
    }
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
    const productsInPackage: ProductInOrder[] = [];
    let productTotalPrice: number = 0;
    for (const attr of productAttrs) {
      const orderProduct = await this.newOrderProduct(order, attr);
      if (orderProduct.isDeleted === true) continue;
      orderProducts.push(orderProduct);
      productsInPackage.push({
        productInfor: orderProduct.product,
        quantity: orderProduct.quantity,
      });
      productTotalPrice += orderProduct.totalPrice;
    }
    return { orderProducts, productTotalPrice, productsInPackage };
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
  static async findByOrder(orderDoc: OrderDoc) {
    const orderProducts = await OrderProduct.find({
      order: orderDoc.id,
    }).populate('product');
    const products: ProductInOrder[] = [];
    for (const od of orderProducts) {
      products.push({
        productInfor: od.product,
        quantity: od.quantity,
      });
    }
    return products;
  }
}
