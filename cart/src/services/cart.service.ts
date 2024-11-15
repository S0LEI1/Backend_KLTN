import {
  BadRequestError,
  NotFoundError,
  Pagination,
} from '@share-package/common';
import { User } from '../models/user';
import { Cart } from '../models/cart';
import { ProductService } from './product.service';
import { CartProduct } from '../models/cart-product';
import { CartProductService } from './cart-product.service';
import { ProductDoc } from '../models/product';
interface ProductInCart {
  info: ProductDoc;
  quantity: number;
  totalPrice: number;
}
interface CartAttr {
  productId: string;
  quantity: number;
}
export class CartService {
  static async getCartByUserId(id: string) {
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) throw new NotFoundError('User');
    const cart = await Cart.findOne({ user: user.id });
    if (!cart) throw new NotFoundError('Cart');
    return cart;
  }
  static async add(userId: string, productId: string, quantity: number) {
    const cart = await this.getCartByUserId(userId);
    const product = await ProductService.readOne(productId);
    const cartProductExist = await CartProductService.getCartProduct(
      cart.id,
      product.id
    );
    let totalPrice = 0;
    if (product.discount !== 0) {
      const discount = (product.discount / 100) * product.salePrice;
      totalPrice = (product.salePrice - discount) * quantity;
    }
    totalPrice = product.salePrice * quantity;
    if (cartProductExist) {
      cartProductExist.set({
        quantity: cartProductExist.quantity + quantity,
        totalPrice: totalPrice + cartProductExist.totalPrice,
      });
      await cartProductExist.save();
      return { cartProduct: cartProductExist };
    }
    const cartProduct = CartProduct.build({
      cart: cart,
      product: product,
      quantity: quantity,
      totalPrice: totalPrice,
    });
    await cartProduct.save();
    return { cartProduct };
  }
  static async getProductInCart(userId: string, date: string) {
    const cart = await this.getCartByUserId(userId);
    const query = Pagination.query();
    const sort = Pagination.query();
    query.cart = cart.id;
    query.isDeleted = false;
    sort.createdAt = -1;
    if (date === 'asc') sort.createdAt = 1;
    if (date === 'desc') sort.createdAt = -1;
    const cartProducts = await CartProduct.find(query)
      .populate('product')
      .sort(sort);
    let totalPrice = 0;
    const products: ProductInCart[] = [];
    cartProducts.map((cp) => {
      totalPrice += cp.totalPrice;
      products.push({
        info: cp.product,
        quantity: cp.quantity,
        totalPrice: cp.totalPrice,
      });
    });
    return { totalPrice: Math.round(totalPrice * 100) / 10, products };
  }
  static async updateCart(userId: string, cartAtts: CartAttr[]) {
    const cart = await this.getCartByUserId(userId);
    let totalPrice = 0;
    const products: ProductInCart[] = [];
    for (const attr of cartAtts) {
      const cartProduct = await CartProduct.findOne({
        cart: cart.id,
        product: attr.productId,
        isDeleted: false,
      }).populate('product');
      if (!cartProduct) continue;
      // let totalPrice = 0;
      if (cartProduct.product.discount !== 0) {
        const discount =
          (cartProduct.product.discount / 100) * cartProduct.product.salePrice;
        totalPrice = (cartProduct.product.salePrice - discount) * attr.quantity;
      }
      totalPrice = cartProduct.product.salePrice * attr.quantity;
      cartProduct.set({
        quantity: attr.quantity,
        totalPrice: Math.round(totalPrice * 100) / 10,
      });
      await cartProduct.save();
      products.push({
        info: cartProduct.product,
        quantity: cartProduct.quantity,
        totalPrice: cartProduct.totalPrice,
      });
    }
    return products;
  }
  static async deleteProduct(userId: string, productIds: string[]) {
    const cart = await this.getCartByUserId(userId);
    for (const id of productIds) {
      const cartProduct = await CartProduct.findOne({
        cart: cart.id,
        product: id,
        isDeleted: false,
      });
      if (!cartProduct) continue;
      cartProduct.set({ isDeleted: true });
      await cartProduct.save();
    }
  }
}
