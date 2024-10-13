import {
  Listener,
  NotFoundError,
  ProductUpdatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';
import { Suplier } from '../../../models/suplier';

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent> {
  subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {
    const product = await Product.findProduct(data.id);
    if (!product) throw new NotFoundError('Product');
    const category = await Category.findCategory(data.categoryId);
    if (!category) throw new NotFoundError('Category');
    const suplier = await Suplier.findSuplier(data.suplierId);
    if (!suplier) throw new NotFoundError('Suplier');
    product.set({
      name: data.name,
      description: data.description,
      category: category,
      suplier: suplier,
      imageUrl: data.imageUrl,
      expire: data.expire,
      quantity: data.quantity,
      featured: data.featured,
      discount: data.discount,
      active: data.active,
    });
    await product.save();
    msg.ack();
  }
}
