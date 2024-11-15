import { CartProduct } from '../models/cart-product';

export class CartProductService {
  static async getCartProduct(cartId: string, productId: string) {
    const cartProduct = await CartProduct.findOne({
      cart: cartId,
      product: productId,
      isDeleted: false,
    });
    return cartProduct;
  }
}
