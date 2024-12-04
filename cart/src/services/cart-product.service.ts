import {
  BadRequestError,
  NotFoundError,
  calcPrice,
} from '@share-package/common';
import { CartDoc } from '../models/cart';
import { CartProduct } from '../models/cart-product';
import { ProductService } from './product.service';
import { ItemInCart } from './cart.service';

export class CartProductService {
  static async getCartProduct(cartId: string, productId: string) {
    const cartProduct = await CartProduct.findOne({
      cart: cartId,
      product: productId,
      isDeleted: false,
    });
    return cartProduct;
  }
  static async addProducToCart(
    cartDoc: CartDoc,
    product: { id: string; quantity: number }
  ) {
    const productExist = await ProductService.readOne(product.id);
    if (!product) throw new NotFoundError('Product');
    const cartProductExist = await CartProductService.getCartProduct(
      cartDoc.id,
      productExist.id
    );
    const totalPrice = calcPrice(
      productExist.salePrice,
      product.quantity,
      productExist.discount
    );
    if (!cartProductExist) {
      const cartProduct = CartProduct.build({
        cart: cartDoc,
        product: productExist,
        quantity: product.quantity,
        totalPrice: totalPrice,
      });
      await cartProduct.save();
      return { cartProduct: cartProduct, product: productExist };
    }
    if (product.quantity + cartProductExist.quantity > productExist.quantity)
      throw new BadRequestError('Insufficient product quantity');
    const newQuantity = cartProductExist.quantity + product.quantity;
    const newTotalPrice = cartProductExist.totalPrice + totalPrice;
    cartProductExist.set({ quantity: newQuantity, totalPrice: newTotalPrice });
    await cartProductExist.save();
    return { cartProduct: cartProductExist, product: productExist };
  }
  static async getProductInCart(
    query: Record<string, any>,
    sort: Record<string, any>
  ) {
    const cartProducts = await CartProduct.find(query)
      .sort(sort)
      .populate('product');
    const productsInCart: ItemInCart[] = [];
    let totalProductPrice = 0;
    let totalProductQuantity = 0;
    for (const cartProduct of cartProducts) {
      const totalPrice = calcPrice(
        cartProduct.product.salePrice,
        cartProduct.quantity,
        cartProduct.product.discount
      );
      totalProductPrice += totalPrice;
      totalProductQuantity += cartProduct.quantity;
      productsInCart.push({
        itemId: cartProduct.product.id,
        name: cartProduct.product.name,
        imageUrl: cartProduct.product.imageUrl,
        salePrice: cartProduct.product.salePrice,
        discount: cartProduct.product.discount,
        quantity: cartProduct.quantity,
        totalPrice: totalPrice,
        createdAt: cartProduct.createdAt,
        type: cartProduct.type,
      });
    }
    return { productsInCart, totalProductPrice, totalProductQuantity };
  }
}
