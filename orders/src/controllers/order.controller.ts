import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { OrderServiceService } from '../services/order-service.service';
import { OrderPackageService } from '../services/order-package.service';

export class OrderController {
  static async newOrder(req: Request, res: Response) {
    const creEmpId = req.currentUser!.id;
    const { type } = req.currentUser!;
    const { execEmpId, customerId } = req.body;
    try {
      const order = await OrderService.newOrder({
        creatorId: creEmpId,
        execEmpId: execEmpId,
        customerId: customerId,
        type,
      });
      res.status(201).send({ message: 'POST: Order successfully', order });
    } catch (error) {
      console.log(error);
    }
  }
  static async addAndDelete(req: Request, res: Response) {
    const { services, packages, products } = req.body;
    const { orderId } = req.params;
    try {
      const order = await OrderService.addAndRemove(
        orderId,
        services,
        packages,
        products
      );
      res.status(201).send({
        message: 'POST:Add successfullt',
        order: order.orderDoc,
        products: order.products,
        services: order.services,
        package: order.packages,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async readOrders(req: Request, res: Response) {
    const {
      pages = 1,
      status,
      cusName,
      creName,
      execName,
      createdAt,
      cusId,
      creId,
      execId,
      date,
    } = req.query;
    const { type, id } = req.currentUser!;
    try {
      const { orders, totalDocuments } = await OrderService.readOrders(
        parseInt(pages as string),
        status as string,
        id as string,
        cusName as string,
        creId as string,
        creName as string,
        execId as string,
        execName as string,
        createdAt as string,
        date as string,
        type as string
      );
      res
        .status(200)
        .send({ message: 'GET: Orders successfully', orders, totalDocuments });
    } catch (error) {
      console.log(error);
    }
  }
  static async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { order, packages, services, products, creator, customer } =
        await OrderService.getOne(id);
      res.status(200).send({
        message: 'GET: Order successfully',
        products,
        services,
        order: {
          customerId: customer.id,
          customerName: customer.fullName,
          customerPhone: customer.phoneNumber,
          creatorId: creator.id,
          creatorName: creator.fullName,
          creatorPhone: creator.phoneNumber,
          preTaxTotal: order.preTaxTotal,
          tax: order.tax,
          status: order.status,
          isDeleted: order.isDeleted,
          createdAt: order.createdAt,
          postTaxTotal: order.postTaxTotal,
          id: order.id,
        },
        packages,
        // creator: createEmp,
        // customer: customer,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async cancelOrder(req: Request, res: Response) {
    const { orderId } = req.params;
    const { id, type } = req.currentUser!;
    const order = await OrderService.cancelOrder(orderId, id, type);
    res
      .status(200)
      .send({ message: 'PATCH: Cancel order successfully', order });
  }
  static async findByUserPhone(req: Request, res: Response) {
    const { phoneNumber, name } = req.query;
    const orders = await OrderService.findByPhoneNumer(
      phoneNumber as string,
      name as string
    );
    res
      .status(200)
      .send({ message: 'GET: Order by customer phone successfully', orders });
  }
  static async deleteOrder(req: Request, res: Response) {
    const { orderId } = req.params;
    const order = await OrderService.deleteOrder(orderId);
    res.status(200).send({ message: 'PATCH:Delete order successfully' });
  }
  static async addUsageLog(req: Request, res: Response) {
    const { orderId, packageId, serviceId } = req.body;
    const { serviceEmebedded, count } = await OrderService.addUsageLog(
      orderId,
      packageId,
      serviceId
    );
    res
      .status(200)
      .send({ message: 'PATCH: Update successfully', serviceEmebedded, count });
  }
  static async exportPdf(req: Request, res: Response) {
    const pdfDoc = await PDFDocument.create();

    // Add a blank page to the document
    const page = pdfDoc.addPage([550, 750]);

    // Get the form so we can add fields to it
    const form = pdfDoc.getForm();

    // Add the superhero text field and description
    page.drawText('Enter your favorite superhero:', {
      x: 50,
      y: 700,
      size: 20,
    });

    const superheroField = form.createTextField('favorite.superhero');
    superheroField.setText('One Punch Man');
    superheroField.addToPage(page, { x: 55, y: 640 });

    // Add the rocket radio group, labels, and description
    page.drawText('Select your favorite rocket:', { x: 50, y: 600, size: 20 });

    page.drawText('Falcon Heavy', { x: 120, y: 560, size: 18 });
    page.drawText('Saturn IV', { x: 120, y: 500, size: 18 });
    page.drawText('Delta IV Heavy', { x: 340, y: 560, size: 18 });
    page.drawText('Space Launch System', { x: 340, y: 500, size: 18 });

    const rocketField = form.createRadioGroup('favorite.rocket');
    rocketField.addOptionToPage('Falcon Heavy', page, { x: 55, y: 540 });
    rocketField.addOptionToPage('Saturn IV', page, { x: 55, y: 480 });
    rocketField.addOptionToPage('Delta IV Heavy', page, { x: 275, y: 540 });
    rocketField.addOptionToPage('Space Launch System', page, {
      x: 275,
      y: 480,
    });
    rocketField.select('Saturn IV');

    // Add the gundam check boxes, labels, and description
    page.drawText('Select your favorite gundams:', { x: 50, y: 440, size: 20 });

    page.drawText('Exia', { x: 120, y: 400, size: 18 });
    page.drawText('Kyrios', { x: 120, y: 340, size: 18 });
    page.drawText('Virtue', { x: 340, y: 400, size: 18 });
    page.drawText('Dynames', { x: 340, y: 340, size: 18 });

    const exiaField = form.createCheckBox('gundam.exia');
    const kyriosField = form.createCheckBox('gundam.kyrios');
    const virtueField = form.createCheckBox('gundam.virtue');
    const dynamesField = form.createCheckBox('gundam.dynames');

    exiaField.addToPage(page, { x: 55, y: 380 });
    kyriosField.addToPage(page, { x: 55, y: 320 });
    virtueField.addToPage(page, { x: 275, y: 380 });
    dynamesField.addToPage(page, { x: 275, y: 320 });

    exiaField.check();
    dynamesField.check();

    // Add the planet dropdown and description
    page.drawText('Select your favorite planet*:', { x: 50, y: 280, size: 20 });

    const planetsField = form.createDropdown('favorite.planet');
    planetsField.addOptions(['Venus', 'Earth', 'Mars', 'Pluto']);
    planetsField.select('Pluto');
    planetsField.addToPage(page, { x: 55, y: 220 });

    // Add the person option list and description
    page.drawText('Select your favorite person:', { x: 50, y: 180, size: 18 });

    const personField = form.createOptionList('favorite.person');
    personField.addOptions([
      'Julius Caesar',
      'Ada Lovelace',
      'Cleopatra',
      'Aaron Burr',
      'Mark Antony',
    ]);
    personField.select('Ada Lovelace');
    personField.addToPage(page, { x: 55, y: 70 });

    // Just saying...
    page.drawText(`* Pluto should be a planet too!`, {
      x: 15,
      y: 15,
      size: 15,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('order.pdf', pdfBytes);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="order.pdf"`,
    });
  }
}
