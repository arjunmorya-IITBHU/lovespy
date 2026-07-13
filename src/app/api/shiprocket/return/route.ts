import { NextResponse } from "next/server";
import { getOrders, updateOrderDetails, dbConnect } from "@/lib/dbServer";
import OrderModel from "@/models/Order";
import { createShiprocketReturn } from "@/lib/shiprocket";

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

    // Call return helper
    const result = await createShiprocketReturn(order);

    // Update order logistics status to show return in progress
    const updates = {
      shiprocketStatus: "Processing" as const, // Or return initiated
      status: "confirmed" as const // Returns reset to confirmed/processing state
    };
    await updateOrderDetails(order.id, updates);

    return NextResponse.json({
      success: true,
      message: "Return order registered with Shiprocket successfully.",
      returnOrderId: result.return_order_id,
      returnShipmentId: result.return_shipment_id
    });
  } catch (error: any) {
    console.error("Error creating return order:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
