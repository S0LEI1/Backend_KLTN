// import { BadRequestError, NotFoundError } from '@share-package/common';
// import { AppointmentDoc } from '../models/appointment';
// import { Order } from '../models/order';
// import { AppointmentOrder } from '../models/appointment-order';
// import { OrderServiceM } from '../models/order-service';

// export interface OrderAttr {
//   orderId: string;
//   packageId?: string;
//   serviceId: string;
//   // execEmp?: string[];
//   quantity: number;
// }

// export interface OrderInAppointment {
//   packageId: string;
//   name: string;
//   salePrice: number;
//   imageUrl: string;
//   quantity: number;
//   totalPrice: number;
// }

// export class AppointmentOrderService {
//   static async newAppointmentOrder(
//     appointmentDoc: AppointmentDoc,
//     orderAttr: OrderAttr
//   ) {
//     const existOrder = await Order.findOrder(orderAttr.orderId);
//     if(!existOrder) throw new NotFoundError('Order');
//     if(orderAttr.packageId){
//         const existAOrder = await AppointmentOrder.findOne({appointment: appointmentDoc.id, order: existOrder.id, package: orderAttr.packageId});
//         if(existAOrder) throw new BadRequestError('Appointment-Order of package already exist');
//     }
//     // find Order-Service
//     const oService = await OrderServiceM.findOne({order: existOrder.id, service: orderAttr.serviceId});
//     if(!oService) throw new NotFoundError('Order-Service')
//     const {usageLogs, quantity} = oService;
//     if(usageLogs!.length <= quantity) throw new BadRequestError('Number of Uses Exhausted.');

//   }
// }
