import {
  BadRequestError,
  NotFoundError,
  Pagination,
  calcPrice,
  roundPrice,
} from '@share-package/common';
import { User } from '../models/user';
import { Cart } from '../models/cart';
import { ProductService } from './product.service';
import { CartProduct } from '../models/cart-product';
import { CartProductService } from './cart-product.service';
import { ProductDoc } from '../models/product';
import { CartServiceServices } from './cart-service.service';
import { CartPackageServices } from './cart-package.service';
import { CartService } from '../models/cart-service';
import { CartPackage } from '../models/cart-package';
export interface ItemInCart {
  itemId: string;
  name: string;
  imageUrl: string;
  salePrice: number;
  discount: number;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
}
interface CartAttr {
  id: string;
  quantity: number;
}
export enum AddType {
  Product = 'product',
  Service = 'service',
  Package = 'package',
}
export class CartServices {
  static async getCartByUserId(id: string) {
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) throw new NotFoundError('User');
    const cart = await Cart.findOne({ user: user.id });
    if (!cart) throw new NotFoundError('Cart');
    return cart;
  }
  static async add(
    userId: string,
    item: { id: string; quantity: number },
    type: string
  ) {
    const cart = await this.getCartByUserId(userId);
    // find product, service, package by item id;
    if (type === AddType.Product) {
      const { cartProduct, product } = await CartProductService.addProducToCart(
        cart,
        item
      );
      const itemInCart: ItemInCart = {
        itemId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        salePrice: product.salePrice,
        discount: product.discount,
        quantity: cartProduct.quantity,
        totalPrice: cartProduct.totalPrice,
        createdAt: cartProduct.createdAt,
      };
      return itemInCart;
    }
    if (type === AddType.Service) {
      const { cartService, service } =
        await CartServiceServices.addServiceToCart(cart, item);
      const itemInCart: ItemInCart = {
        itemId: service.id,
        name: service.name,
        imageUrl: service.imageUrl,
        salePrice: service.salePrice,
        discount: service.discount,
        quantity: cartService.quantity,
        totalPrice: cartService.totalPrice,
        createdAt: cartService.createdAt,
      };
      return itemInCart;
    }
    if (type === AddType.Package) {
      const { cartPackage, packageExsit } =
        await CartPackageServices.addPackageToCart(cart, item);
      const itemInCart: ItemInCart = {
        itemId: packageExsit.id,
        name: packageExsit.name,
        imageUrl: packageExsit.imageUrl,
        salePrice: packageExsit.salePrice,
        discount: packageExsit.discount,
        quantity: cartPackage.quantity,
        totalPrice: cartPackage.totalPrice,
        createdAt: cartPackage.createdAt,
      };
      return itemInCart;
    }
  }
  static async getItemsInCart(userId: string, date: string) {
    const cart = await this.getCartByUserId(userId);
    const query = Pagination.query();
    const sort = Pagination.query();
    query.cart = cart.id;
    query.isDeleted = false;
    sort.createdAt = -1;
    if (date === 'asc') sort.createdAt = 1;
    if (date === 'desc') sort.createdAt = -1;
    const itemsInCart: ItemInCart[] = [];
    let totalPrice = 0;
    let totalQuantity = 0;
    const { productsInCart, totalProductPrice, totalProductQuantity } =
      await CartProductService.getProductInCart(query, sort);
    itemsInCart.push(...productsInCart);
    totalPrice += totalProductPrice;
    totalQuantity += totalProductQuantity;
    const { servicesInCart, totalServicesPrice, totalServicesQuantity } =
      await CartServiceServices.getServiceInCart(query, sort);
    itemsInCart.push(...servicesInCart);
    totalPrice += totalServicesPrice;
    totalQuantity += totalServicesQuantity;
    const { packagesInCart, totalPackagePrice, totalPackageQuantity } =
      await CartPackageServices.getPackageInCart(query, sort);
    itemsInCart.push(...packagesInCart);
    totalPrice += totalPackagePrice;
    totalQuantity += totalPackageQuantity;
    itemsInCart.sort((a, b) =>
      date === 'asc'
        ? a.createdAt!.getTime() - b.createdAt!.getTime()
        : b.createdAt!.getTime() - a.createdAt!.getTime()
    );
    return { itemsInCart, totalPrice, totalQuantity };
  }
  static async updateCart(userId: string, cartAtts: CartAttr[]) {
    const cart = await this.getCartByUserId(userId);
    let totalPrice = 0;
    const itemsIncart: ItemInCart[] = [];
    for (const attr of cartAtts) {
      const cartProduct = await CartProduct.findOne({
        cart: cart.id,
        product: attr.id,
        isDeleted: false,
      }).populate('product');
      const cartService = await CartService.findOne({
        cart: cart.id,
        service: attr.id,
        isDeleted: false,
      }).populate('service');
      const cartPackage = await CartPackage.findOne({
        cart: cart.id,
        package: attr.id,
        isDeleted: false,
      }).populate('package');
      if (!cartProduct && !cartService && !cartPackage)
        throw new NotFoundError(`Item in cart not found ${attr.id}`);
      // let totalPrice = 0;
      if (cartProduct) {
        const totalPrice = calcPrice(
          cartProduct.product.salePrice,
          attr.quantity,
          cartProduct.product.discount
        );
        cartProduct.set({
          totalPrice: roundPrice(totalPrice),
          quantity: attr.quantity,
        });
        await cartProduct.save();
        itemsIncart.push({
          itemId: cartProduct.product.id,
          name: cartProduct.product.name,
          imageUrl: cartProduct.product.imageUrl,
          salePrice: cartProduct.product.salePrice,
          discount: cartProduct.product.discount,
          quantity: cartProduct.quantity,
          totalPrice: cartProduct.totalPrice,
          createdAt: cartProduct.createdAt,
        });
        continue;
      }
      if (cartService) {
        const totalPrice = calcPrice(
          cartService.service.salePrice,
          attr.quantity,
          cartService.service.discount
        );
        cartService.set({
          totalPrice: roundPrice(totalPrice),
          quantity: attr.quantity,
        });
        await cartService.save();
        itemsIncart.push({
          itemId: cartService.service.id,
          name: cartService.service.name,
          imageUrl: cartService.service.imageUrl,
          salePrice: cartService.service.salePrice,
          discount: cartService.service.discount,
          quantity: cartService.quantity,
          totalPrice: cartService.totalPrice,
          createdAt: cartService.createdAt,
        });
        continue;
      }
      if (cartPackage) {
        const totalPrice = calcPrice(
          cartPackage.package.salePrice,
          attr.quantity,
          cartPackage.package.discount!
        );
        cartPackage.set({
          totalPrice: roundPrice(totalPrice),
          quantity: attr.quantity,
        });
        await cartPackage.save();
        itemsIncart.push({
          itemId: cartPackage.package.id,
          name: cartPackage.package.name,
          imageUrl: cartPackage.package.imageUrl,
          salePrice: cartPackage.package.salePrice,
          discount: cartPackage.package.discount,
          quantity: cartPackage.quantity,
          totalPrice: cartPackage.totalPrice,
          createdAt: cartPackage.createdAt,
        });
        continue;
      }
    }
    return itemsIncart;
  }
  static async deleteItems(userId: string, ids: string[]) {
    const cart = await this.getCartByUserId(userId);
    for (const id of ids) {
      const cartProduct = await CartProduct.findOne({
        cart: cart.id,
        product: id,
        isDeleted: false,
      });
      const cartService = await CartService.findOne({
        cart: cart.id,
        service: id,
        isDeleted: false,
      });
      const cartPackage = await CartPackage.findOne({
        cart: cart.id,
        package: id,
        isDeleted: false,
      });
      if (!cartProduct && !cartService && !cartPackage)
        throw new BadRequestError('Item in cart not found');
      if (cartProduct) {
        cartProduct.set({ isDeleted: true });
        await cartProduct.save();
      }
      if (cartService) {
        cartService.set({ isDeleted: true });
        await cartService.save();
      }
      if (cartPackage) {
        cartPackage.set({ isDeleted: true });
        await cartPackage.save();
      }
    }
  }
}
