import { NextResponse } from "next/server";
import { getOrders, dbConnect } from "@/lib/dbServer";
import OrderModel from "@/models/Order";
import { getShiprocketLabel, isShiprocketSimulated } from "@/lib/shiprocket";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return new Response("Missing orderId parameter.", { status: 400 });
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
      return new Response("Order not found.", { status: 404 });
    }

    const simulated = await isShiprocketSimulated();

    if (!simulated && order.shiprocketShipmentId) {
      const labelUrl = await getShiprocketLabel(order.shiprocketShipmentId);
      // Redirect to the actual label URL
      return NextResponse.redirect(labelUrl);
    }

    // Otherwise, render a beautiful simulated HTML label for printing
    const awb = order.shiprocketAwb || `SR-AWB-SIM-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const courier = order.shiprocketCourier || "Delhivery (Express Simulated)";
    const date = order.shiprocketDispatchDate || new Date().toISOString().split("T")[0];
    const itemsHtml = (order.items || []).map((it: any) => `
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding: 6px 0; font-size: 11px;">
        <span>${it.name} (x${it.qty})</span>
        <strong>Prepaid</strong>
      </div>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${order.orderNumber}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Libre+Barcode+128&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f1f5f9;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .label-container {
            width: 400px;
            background: white;
            border: 2px solid #000;
            padding: 16px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            position: relative;
            box-sizing: border-box;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .logo {
            font-weight: 800;
            font-size: 16px;
            color: #d946ef;
            letter-spacing: 1px;
          }
          .routing {
            font-weight: 800;
            font-size: 20px;
            border: 2px solid #000;
            padding: 2px 8px;
            text-transform: uppercase;
          }
          .barcode-box {
            text-align: center;
            margin: 16px 0;
            border-bottom: 2px solid #000;
            padding-bottom: 16px;
          }
          .barcode {
            font-family: 'Libre Barcode 128', cursive;
            font-size: 54px;
            line-height: 54px;
            margin: 0;
          }
          .awb-text {
            font-family: monospace;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-top: 4px;
          }
          .address-section {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .section-title {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 4px;
          }
          .address-text {
            font-size: 11px;
            line-height: 1.4;
            font-weight: 600;
          }
          .details-grid {
            display: grid;
            grid-cols: 2;
            grid-template-columns: 1fr 1fr;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
            gap: 12px;
          }
          .detail-item {
            font-size: 11px;
          }
          .items-box {
            margin-top: 8px;
          }
          .stamp {
            position: absolute;
            bottom: 20px;
            right: 20px;
            border: 3px double #d946ef;
            color: #d946ef;
            font-size: 14px;
            font-weight: 800;
            padding: 4px 10px;
            transform: rotate(-12deg);
            text-transform: uppercase;
            border-radius: 4px;
            opacity: 0.8;
          }
          .actions {
            margin-top: 16px;
            display: flex;
            justify-content: center;
          }
          .print-btn {
            background-color: #0f172a;
            color: white;
            border: none;
            padding: 8px 24px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .print-btn:hover {
            background-color: #1e293b;
            transform: translateY(-1px);
          }
          @media print {
            body {
              background-color: white;
              padding: 0;
              display: block;
            }
            .label-container {
              box-shadow: none;
              border: 2px solid #000;
              margin: 0 auto;
            }
            .actions {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div>
          <div class="label-container">
            <div class="header">
              <div class="logo">LOVESPY PREPAID</div>
              <div class="routing">STD</div>
            </div>
            
            <div class="address-section">
              <div class="section-title">Ship To (Recipient):</div>
              <div class="address-text">
                <strong>${order.deliveryName || 'N/A'}</strong><br/>
                ${order.address || `${order.deliveryLine1}, ${order.deliveryLine2 || ''}, ${order.deliveryCity}, ${order.deliveryState} - ${order.deliveryPincode}`}<br/>
                Phone: ${order.deliveryPhone || 'N/A'}
              </div>
            </div>

            <div class="address-section">
              <div class="section-title">Shipper (Return Address):</div>
              <div class="address-text" style="font-weight: 400; color: #334155;">
                Lovespy Fulfillment Center, Plot 44, Okhla Industrial Area Phase 3, New Delhi, Delhi - 110020
              </div>
            </div>

            <div class="barcode-box">
              <div class="barcode">${awb}</div>
              <div class="awb-text">AWB: ${awb}</div>
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <div class="section-title">Courier Partner:</div>
                <strong>${courier}</strong>
              </div>
              <div class="detail-item">
                <div class="section-title">Order Ref:</div>
                <strong>${order.orderNumber}</strong>
              </div>
              <div class="detail-item">
                <div class="section-title">Dispatch Date:</div>
                <strong>${date}</strong>
              </div>
              <div class="detail-item">
                <div class="section-title">Weight:</div>
                <strong>0.50 KG</strong>
              </div>
            </div>

            <div class="items-box">
              <div class="section-title">Package Contents:</div>
              ${itemsHtml}
            </div>

            <div class="stamp">Lovespy Verified</div>
          </div>

          <div class="actions">
            <button class="print-btn" onclick="window.print()">Print Label</button>
          </div>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error: any) {
    console.error("Error in label API:", error);
    return new Response(`Error generating label: ${error.message}`, { status: 500 });
  }
}
