import { NotFoundError, Pagination, calcPrice } from '@share-package/common';
import { Product } from '../models/product';
import { Service } from '../models/service';
import { CartService } from '../models/cart-service';
import { Cart, CartDoc } from '../models/cart';
import { ItemInCart } from './cart.service';
export class CartServiceServices {
  static async getService(id: string) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const service = await Service.findOne(query, {
      id: 1,
      name: 1,
      imageUrl: 1,
      salePrice: 1,
    });
    if (!service) throw new NotFoundError('Service');
    return service;
  }
  static async getCartService(cartId: string, serviceId: string) {
    const cartService = await CartService.findOne({
      cart: cartId,
      service: serviceId,
      isDeleted: false,
    });
    return cartService;
  }
  static async addServiceToCart(
    cartDoc: CartDoc,
    item: { id: string; quantity: number }
  ) {
    const service = await this.getService(item.id);
    if (!service) throw new NotFoundError('Service');
    const cartServiceExist = await this.getCartService(cartDoc.id, item.id);
    if (!cartServiceExist) {
      const totalPrice = calcPrice(
        service.salePrice,
        item.quantity,
        service.discount
      );
      const cartService = CartService.build({
        cart: cartDoc,
        service: service,
        quantity: item.quantity,
        totalPrice: totalPrice,
      });
      await cartService.save();
      return { cartService: cartService, service: service };
    }
    const newQuantity = cartServiceExist.quantity + item.quantity;
    let newTotalPrice =
      calcPrice(service.salePrice, item.quantity, service.discount) +
      cartServiceExist.totalPrice;
    cartServiceExist.set({ quantity: newQuantity, totalPrice: newTotalPrice });
    await cartServiceExist.save();
    return { cartService: cartServiceExist, service: service };
  }
  static async getServiceInCart(
    query: Record<string, any>,
    sort: Record<string, any>
  ) {
    const cartServices = await CartService.find(query)
      .sort(sort)
      .populate('service');
    let totalServicesPrice = 0;
    let totalServicesQuantity = 0;
    const servicesInCart: ItemInCart[] = [];
    for (const cartSrv of cartServices) {
      const totalPrice = calcPrice(
        cartSrv.service.salePrice,
        cartSrv.quantity,
        cartSrv.service.discount
      );
      totalServicesPrice += totalPrice;
      totalServicesQuantity += cartSrv.quantity;
      servicesInCart.push({
        itemId: cartSrv.service.id,
        name: cartSrv.service.name,
        imageUrl: cartSrv.service.imageUrl,
        salePrice: cartSrv.service.salePrice,
        discount: cartSrv.service.discount,
        quantity: cartSrv.quantity,
        totalPrice: totalPrice,
        createdAt: cartSrv.createdAt,
        type: cartSrv.type,
      });
    }
    return { servicesInCart, totalServicesPrice, totalServicesQuantity };
  }
}
