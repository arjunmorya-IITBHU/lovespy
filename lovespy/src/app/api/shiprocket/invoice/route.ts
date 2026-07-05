import { NextResponse } from "next/server";
import { getOrders, dbConnect } from "@/lib/db";
import OrderModel from "@/models/Order";
import { getShiprocketInvoice, isShiprocketSimulated } from "@/lib/shiprocket";

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

    if (!simulated && order.shiprocketOrderId) {
      const invoiceUrl = await getShiprocketInvoice(order.shiprocketOrderId);
      return NextResponse.redirect(invoiceUrl);
    }

    // Render a premium simulated HTML invoice for printing
    const date = order.date || new Date().toISOString().split("T")[0];
    const trackingNo = order.shiprocketAwb || order.tracking || "Not Dispatched";
    const courier = order.shiprocketCourier || "Not Assigned";
    const paymentId = order.razorpayPaymentId || order.paymentId || "N/A";
    
    const itemsHtml = (order.items || []).map((it: any, idx: number) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 10px 0;">${idx + 1}</td>
        <td style="padding: 10px 0;"><strong>${it.name}</strong></td>
        <td style="padding: 10px 0; text-align: center;">${it.qty}</td>
        <td style="padding: 10px 0; text-align: right;">₹${it.price}</td>
        <td style="padding: 10px 0; text-align: right;">₹${it.price * it.qty}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.orderNumber}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            background-color: #f8fafc;
            display: flex;
            justify-content: center;
          }
          .invoice-box {
            width: 700px;
            background: white;
            padding: 40px;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            position: relative;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .logo {
            font-weight: 800;
            font-size: 24px;
            color: #d946ef;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          .address-col h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            margin: 0 0 8px 0;
          }
          .address-col p {
            font-size: 12px;
            line-height: 1.5;
            color: #334155;
            margin: 0;
          }
          .metadata-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .metadata-table th {
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            padding-bottom: 6px;
            border-bottom: 1px solid #cbd5e1;
          }
          .metadata-table td {
            font-size: 12px;
            padding: 8px 0;
            font-weight: 600;
            color: #0f172a;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
          }
          .totals-section {
            width: 300px;
            margin-left: auto;
            font-size: 13px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            color: #475569;
          }
          .grand-total {
            font-size: 16px;
            font-weight: 800;
            color: #d946ef;
            border-top: 2px solid #f1f5f9;
            padding-top: 10px;
            margin-top: 6px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
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
            margin-top: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .print-btn:hover {
            background-color: #1e293b;
          }
          @media print {
            body {
              background-color: white;
              padding: 0;
            }
            .invoice-box {
              box-shadow: none;
              border: none;
              padding: 0;
            }
            .print-btn {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">LOVESPY</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Premium Surprises & Bespoke Hampers</div>
              </div>
              <div class="invoice-title">
                <h1>RETAIL INVOICE</h1>
                <div style="font-size: 12px; color: #d946ef; font-weight: 700; margin-top: 4px;">#${order.orderNumber}</div>
              </div>
            </div>

            <table class="metadata-table">
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Payment Method</th>
                  <th>Transaction Ref ID</th>
                  <th>Courier Logistics</th>
                  <th>AWB / Tracking ID</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${date}</td>
                  <td>Prepaid (Online)</td>
                  <td style="font-family: monospace;">${paymentId}</td>
                  <td>${courier}</td>
                  <td style="font-family: monospace;">${trackingNo}</td>
                </tr>
              </tbody>
            </table>

            <div class="details-grid">
              <div class="address-col">
                <h3>Sold By (Billing Address):</h3>
                <p>
                  <strong>Lovespy Retail Private Limited</strong><br/>
                  Plot 44, Okhla Industrial Area Phase 3<br/>
                  New Delhi, Delhi - 110020<br/>
                  GSTIN: 07AADCL9215A1Z2
                </p>
              </div>
              <div class="address-col">
                <h3>Shipped To (Shipping Address):</h3>
                <p>
                  <strong>${order.deliveryName || 'Lovespy Customer'}</strong><br/>
                  ${order.address || `${order.deliveryLine1}, ${order.deliveryLine2 || ''}, ${order.deliveryCity}, ${order.deliveryState} - ${order.deliveryPincode}`}<br/>
                  Phone: ${order.deliveryPhone || 'N/A'}
                </p>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
                  <th style="padding: 10px 0; width: 40px;">S.No</th>
                  <th style="padding: 10px 0;">Item Description</th>
                  <th style="padding: 10px 0; text-align: center; width: 60px;">Qty</th>
                  <th style="padding: 10px 0; text-align: right; width: 100px;">Unit Price</th>
                  <th style="padding: 10px 0; text-align: right; width: 100px;">Total Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <strong>₹${order.subtotal || 0}</strong>
              </div>
              <div class="total-row">
                <span>Shipping Charge:</span>
                <strong>₹${order.shippingCharge || 0}</strong>
              </div>
              ${order.discountAmount > 0 ? `
                <div class="total-row" style="color: #ef4444;">
                  <span>Discounts Applied:</span>
                  <strong>-₹${order.discountAmount}</strong>
                </div>
              ` : ''}
              <div class="total-row grand-total">
                <span>Grand Total:</span>
                <span>₹${order.totalAmount || order.total}</span>
              </div>
            </div>

            <div class="footer">
              <p>This is a computer-generated invoice and does not require a physical signature.</p>
              <p>Thank you for choosing Lovespy to craft your beautiful gifting memory! ❤️</p>
            </div>
          </div>

          <button class="print-btn" onclick="window.print()">Print Invoice</button>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return new Response(`Error generating invoice: ${error.message}`, { status: 500 });
  }
}
