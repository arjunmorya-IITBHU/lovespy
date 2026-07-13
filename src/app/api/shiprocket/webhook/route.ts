import { NextResponse } from "next/server";
import { getOrders, updateOrderDetails, dbConnect } from "@/lib/dbServer";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Received Shiprocket Webhook payload:", payload);

    const awb = payload.awb || payload.awb_code;
    const shiprocketOrderId = payload.order_id || payload.shiprocket_order_id;
    const shiprocketStatus = payload.current_status || payload.status;

    if (!awb && !shiprocketOrderId) {
      return NextResponse.json({ success: false, error: "Missing awb or order_id in webhook payload." }, { status: 400 });
    }

    // Try to find the order
    let order: any = null;
    const orders = getOrders();
    order = orders.find((o: any) => 
      (awb && o.shiprocketAwb === awb) || 
      (shiprocketOrderId && (o.shiprocketOrderId === String(shiprocketOrderId) || o.orderNumber === String(shiprocketOrderId)))
    );

    // Fallback to MongoDB
    if (!order) {
      await dbConnect();
      const query = awb 
        ? { shiprocketAwb: awb } 
        : { $or: [{ shiprocketOrderId: String(shiprocketOrderId) }, { orderNumber: String(shiprocketOrderId) }] };
      const orderDoc = await OrderModel.findOne(query);
      if (orderDoc) {
        order = orderDoc.toObject();
      }
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found for status sync." }, { status: 404 });
    }

    // Map Shiprocket status to Lovespy order status
    let mappedStatus = order.status;
    const statusLower = String(shiprocketStatus).toLowerCase();

    if (statusLower.includes("delivered")) {
      mappedStatus = "delivered";
    } else if (statusLower.includes("out for delivery") || statusLower.includes("out_for_delivery")) {
      mappedStatus = "out_for_delivery";
    } else if (statusLower.includes("in transit") || statusLower.includes("in_transit")) {
      mappedStatus = "shipped";
    } else if (statusLower.includes("shipped") || statusLower.includes("dispatched")) {
      mappedStatus = "shipped";
    } else if (statusLower.includes("packed") || statusLower.includes("ready to ship")) {
      mappedStatus = "packed";
    } else if (statusLower.includes("processing") || statusLower.includes("confirmed")) {
      mappedStatus = "confirmed";
    }

    // Map to normalized ShiprocketStatus values
    let cleanShiprocketStatus: any = order.shiprocketStatus || "Processing";
    if (statusLower.includes("delivered")) cleanShiprocketStatus = "Delivered";
    else if (statusLower.includes("out for delivery") || statusLower.includes("out_for_delivery")) cleanShiprocketStatus = "Out For Delivery";
    else if (statusLower.includes("in transit") || statusLower.includes("in_transit")) cleanShiprocketStatus = "In Transit";
    else if (statusLower.includes("shipped") || statusLower.includes("dispatched")) cleanShiprocketStatus = "Shipped";
    else if (statusLower.includes("packed") || statusLower.includes("ready to ship")) cleanShiprocketStatus = "Packed";
    else if (statusLower.includes("processing") || statusLower.includes("confirmed")) cleanShiprocketStatus = "Processing";

    const updates = {
      shiprocketStatus: cleanShiprocketStatus,
      status: mappedStatus
    };

    await updateOrderDetails(order.id, updates);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully via webhook.",
      orderId: order.id,
      updates
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
