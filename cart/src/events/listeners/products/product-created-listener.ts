import {
  Listener,
  NotFoundError,
  ProductCreatedEvent,
  Subjects,
} from '@share-package/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';
import { Suplier } from '../../../models/suplier';

export class ProductCreatedListener extends Listener<ProductCreatedEvent> {
  subject: Subjects.ProductCreated = Subjects.ProductCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: ProductCreatedEvent['data'], msg: Message) {
    console.log(data);

    const category = await Category.findCategory(data.categoryId);
    if (!category) throw new NotFoundError('Category');
    const suplier = await Suplier.findSuplier(data.suplierId);
    if (!suplier) throw new NotFoundError('Suplier');
    const product = Product.build({
      id: data.id,
      name: data.name,
      description: data.description,
      category: category,
      suplier: suplier,
      imageUrl: data.imageUrl,
      expire: data.expire,
      quantity: data.quantity,
      salePrice: data.salePrice,
      code: data.code,
      discount: data.discount,
      featured: data.featured,
    });
    await product.save();
    msg.ack();
  }
}
