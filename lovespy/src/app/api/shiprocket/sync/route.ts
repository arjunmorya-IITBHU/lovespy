import { NextResponse } from "next/server";
import { getOrders, updateOrderDetails, dbConnect } from "@/lib/dbServer";
import OrderModel from "@/models/Order";
import { trackShiprocketAWB, isShiprocketSimulated } from "@/lib/shiprocket";

export async function GET() {
  try {
    const simulated = await isShiprocketSimulated();

    // 1. Gather all active orders from memory
    let activeOrders = getOrders().filter((o: any) => 
      (o.shiprocketOrderId || o.shiprocketAwb) && 
      o.status !== "delivered"
    );

    // 2. Fetch from MongoDB
    await dbConnect();
    const dbOrders = await OrderModel.find({
      $and: [
        { $or: [{ shiprocketOrderId: { $ne: "" } }, { shiprocketAwb: { $ne: "" } }] },
        { status: { $ne: "delivered" } }
      ]
    });

    // Merge or process active database docs
    const dbOrderObjects = dbOrders.map(doc => doc.toObject());
    const allActive = [...activeOrders];
    for (const dbo of dbOrderObjects) {
      if (!allActive.some(ao => ao.id === dbo.id)) {
        allActive.push(dbo);
      }
    }

    const updatedCount = allActive.length;
    const updatesSummary = [];

    // 3. Process each active order
    for (const order of allActive) {
      let nextShiprocketStatus = order.shiprocketStatus || "Processing";
      let nextStatus = order.status || "confirmed";

      if (simulated) {
        // Auto-advance simulated orders step-by-step
        const stages = ["Processing", "Packed", "Shipped", "In Transit", "Out For Delivery", "Delivered"] as const;
        const mainStatusMap = {
          "Processing": "confirmed",
          "Packed": "packed",
          "Shipped": "shipped",
          "In Transit": "shipped",
          "Out For Delivery": "out_for_delivery",
          "Delivered": "delivered"
        } as const;

        const currentIdx = stages.indexOf(nextShiprocketStatus);
        if (currentIdx !== -1 && currentIdx < stages.length - 1) {
          nextShiprocketStatus = stages[currentIdx + 1];
          nextStatus = mainStatusMap[nextShiprocketStatus];
        }
      } else if (order.shiprocketAwb) {
        // Live integration tracking query
        try {
          const tracking = await trackShiprocketAWB(order.shiprocketAwb);
          const statusLower = tracking.status.toLowerCase();

          if (statusLower.includes("delivered")) {
            nextShiprocketStatus = "Delivered";
            nextStatus = "delivered";
          } else if (statusLower.includes("out for delivery") || statusLower.includes("out_for_delivery")) {
            nextShiprocketStatus = "Out For Delivery";
            nextStatus = "out_for_delivery";
          } else if (statusLower.includes("in transit") || statusLower.includes("in_transit")) {
            nextShiprocketStatus = "In Transit";
            nextStatus = "shipped";
          } else if (statusLower.includes("shipped") || statusLower.includes("dispatched")) {
            nextShiprocketStatus = "Shipped";
            nextStatus = "shipped";
          } else if (statusLower.includes("packed") || statusLower.includes("ready to ship")) {
            nextShiprocketStatus = "Packed";
            nextStatus = "packed";
          } else if (statusLower.includes("processing") || statusLower.includes("confirmed")) {
            nextShiprocketStatus = "Processing";
            nextStatus = "confirmed";
          }
        } catch (err) {
          console.error(`Failed to live track AWB ${order.shiprocketAwb}:`, err);
          continue; // skip updating this order if error
        }
      } else {
        // Order dispatched but no AWB generated yet, keep status "Processing"
        nextShiprocketStatus = "Processing";
        nextStatus = "confirmed";
      }

      // Save changes
      const updates = {
        shiprocketStatus: nextShiprocketStatus as any,
        status: nextStatus as any
      };
      
      await updateOrderDetails(order.id, updates);
      updatesSummary.push({
        orderNumber: order.orderNumber,
        previousStatus: order.shiprocketStatus,
        newStatus: nextShiprocketStatus
      });
    }

    return NextResponse.json({
      success: true,
      simulated,
      updatedCount,
      updates: updatesSummary
    });
  } catch (error: any) {
    console.error("Error in sync API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
