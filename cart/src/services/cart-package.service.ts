import { NotFoundError, Pagination, calcPrice } from '@share-package/common';
import { Package } from '../models/package';
import { CartDoc } from '../models/cart';
import { CartPackage } from '../models/cart-package';
import { ItemInCart } from './cart.service';
export class CartPackageServices {
  static async getPackage(id: string) {
    const query = Pagination.query();
    query._id = id;
    query.isDeleted = false;
    const packageExist = await Package.findOne(query, {
      id: 1,
      name: 1,
      imageUrl: 1,
      salePrice: 1,
    });
    if (!packageExist) throw new NotFoundError('PackageExist');
    return packageExist;
  }
  static async getCartPackage(cartId: string, packageId: string) {
    const cartPackage = await CartPackage.findOne({
      cart: cartId,
      package: packageId,
      isDeleted: false,
    });
    return cartPackage;
  }
  static async addPackageToCart(
    cartDoc: CartDoc,
    item: { id: string; quantity: number }
  ) {
    const packageExsit = await this.getPackage(item.id);
    if (!packageExsit) throw new NotFoundError('Service');
    const cartPackageExist = await this.getCartPackage(cartDoc.id, item.id);
    const totalPrice = calcPrice(
      packageExsit.salePrice,
      item.quantity,
      packageExsit.discount
    );
    if (!cartPackageExist) {
      const cartPackage = CartPackage.build({
        cart: cartDoc,
        package: packageExsit,
        quantity: item.quantity,
        totalPrice: totalPrice,
      });
      await cartPackage.save();
      return { cartPackage: cartPackage, packageExsit };
    }
    const newQuantity = cartPackageExist.quantity + item.quantity;
    let newTotalPrice = totalPrice + cartPackageExist.totalPrice;
    cartPackageExist.set({ quantity: newQuantity, totalPrice: newTotalPrice });
    await cartPackageExist.save();
    return { cartPackage: cartPackageExist, packageExsit };
  }
  static async getPackageInCart(
    query: Record<string, any>,
    sort: Record<string, any>
  ) {
    const cartPackages = await CartPackage.find(query)
      .sort(sort)
      .populate('package');
    const packagesInCart: ItemInCart[] = [];
    let totalPackagePrice = 0;
    let totalPackageQuantity = 0;
    for (const cartPacakge of cartPackages) {
      const totalPrice = calcPrice(
        cartPacakge.package.salePrice,
        cartPacakge.quantity,
        cartPacakge.package.discount!
      );
      totalPackagePrice += totalPrice;
      totalPackageQuantity += cartPacakge.quantity;
      packagesInCart.push({
        itemId: cartPacakge.package.id,
        name: cartPacakge.package.name,
        imageUrl: cartPacakge.package.imageUrl,
        salePrice: cartPacakge.package.salePrice,
        discount: cartPacakge.package.discount,
        quantity: cartPacakge.quantity,
        totalPrice: totalPrice,
        createdAt: cartPacakge.createdAt,
        type: cartPacakge.type,
      });
    }
    return { packagesInCart, totalPackagePrice, totalPackageQuantity };
  }
}
