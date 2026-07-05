import { NextResponse } from "next/server";
import { getOrders, updateOrderDetails, dbConnect } from "@/lib/db";
import OrderModel from "@/models/Order";
import { generateShiprocketAWB } from "@/lib/shiprocket";

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

    // AWB assignment requires a shipment ID. In simulator mode we fallback.
    const shipmentId = order.shiprocketShipmentId || order.shiprocketOrderId || `SH-${Date.now()}`;
    if (!shipmentId) {
      return NextResponse.json({ success: false, error: "Order must be dispatched before generating AWB." }, { status: 400 });
    }

    const result = await generateShiprocketAWB(shipmentId);

    // Update order with AWB code, courier, and status
    const updates = {
      shiprocketAwb: result.awb_code,
      shiprocketCourier: result.courier_name,
      shiprocketStatus: "Packed" as const, // Transition to Packed on AWB generation
      shiprocketDispatchDate: new Date().toISOString().split("T")[0],
      status: "packed" as const // Sync standard status to packed
    };

    await updateOrderDetails(order.id, updates);

    return NextResponse.json({
      success: true,
      message: "AWB generated successfully.",
      awbCode: result.awb_code,
      courierName: result.courier_name
    });
  } catch (error: any) {
    console.error("Error generating AWB:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
