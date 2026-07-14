import { NextResponse } from "next/server";
import { getOrders, updateOrderDetails, dbConnect } from "@/lib/dbServer";
import OrderModel from "@/models/Order";
import { createShiprocketOrder } from "@/lib/shiprocket";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId parameter." }, { status: 400 });
    }

    // Try to find the order
    let order: any = null;
    const orders = getOrders();
    order = orders.find((o: any) => o.id === orderId || o.orderNumber === orderId);

    // Fallback to MongoDB
    if (!order) {
      await dbConnect();
      const isMongoId = orderId.match(/^[0-9a-fA-F]{24}$/);
      const query = isMongoId ? { _id: orderId } : { orderNumber: orderId };
      const orderDoc = await OrderModel.findOne(query);
      if (orderDoc) {
        order = orderDoc.toObject();
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    // Dispatch Order to Shiprocket
    const result = await createShiprocketOrder(order);

    // Update order with shiprocket order id and status
    const updates = {
      shiprocketOrderId: result.order_id,
      shiprocketStatus: "Processing" as const,
      status: "confirmed" as const // Sync standard status to confirmed
    };

    await updateOrderDetails(order.id, updates);

    return NextResponse.json({
      success: true,
      message: "Order dispatched to Shiprocket successfully.",
      shiprocketOrderId: result.order_id,
      shipmentId: result.shipment_id
    });
  } catch (error: any) {
    console.error("Error in dispatch API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
