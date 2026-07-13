import { NextResponse } from "next/server";
import { getProducts, getStoreSettings } from "@/lib/dbServer";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

function calculateServerSubtotal(cart: any[]) {
  const products = getProducts();
  return cart.reduce((acc, item) => {
    if (item.type === "custom-hamper") {
      const details = item.details;
      let total = 0;
      if (details?.box) {
        total += details.box.basePrice;
      }
      if (details?.items) {
        total += details.items.reduce((sum: number, it: any) => sum + it.price * it.qty, 0);
      }
      const pers = details?.personalization;
      if (pers) {
        const photoCount = (pers.photos || (pers.photoName ? [pers.photoName] : [])).length;
        total += photoCount * 15;
        if (pers.voiceQrAttached) total += 25;
        
        if (pers.decorations) {
          if (pers.decorations["ad-1"]) total += 99; // Fairy Lights
          if (pers.decorations["ad-2"]) total += 149; // Flowers
          if (pers.decorations["ad-3"]) total += 49; // Ribbon
          if (pers.decorations["ad-4"]) total += 29; // Stickers
          if (pers.decorations["ad-5"]) total += 199; // Velvet
        }
      }
      return acc + total * item.qty;
    } else if (item.type === "custom-surprise-page") {
      return acc + 299 * item.qty;
    } else {
      // Standard product - verify price against database
      const product = products.find((p: any) => p.id === item.id);
      const verifiedPrice = product ? product.price : item.price;
      return acc + verifiedPrice * item.qty;
    }
  }, 0);
}

export async function POST(request: Request) {
  try {
    const { cart, appliedCoupon, useRewardPoints, userPoints, deliveryType, isSurprisePage } = await request.json();

    let finalTotal = 0;

    if (isSurprisePage) {
      finalTotal = 299;
    } else {
      if (!cart || !Array.isArray(cart)) {
        return NextResponse.json({ success: false, error: "Invalid cart data." }, { status: 400 });
      }

      const settings = await getStoreSettings();
      const subtotal = calculateServerSubtotal(cart);

      let shipping = 150;
      if (settings) {
        if (settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold) {
          shipping = 0;
        } else {
          shipping = settings.deliveryCharge;
        }
      } else {
        shipping = subtotal > 2999 ? 0 : 150;
      }

      let discount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.code === "LOVESPY10" && subtotal >= 1999) {
          discount = Math.round(subtotal * 0.1);
        } else if (appliedCoupon.code === "FREEGP" && subtotal >= 1499) {
          discount = 150;
        }
      }

      const rewardsDiscount = 0;

      finalTotal = Math.max(0, subtotal + shipping - discount - rewardsDiscount);
    }

    // Dynamic sandbox fallback check
    let isMock =
      !KEY_ID ||
      !KEY_SECRET ||
      KEY_ID.includes("yourKeyId") ||
      KEY_SECRET.includes("yourRazorpayKeySecret") ||
      KEY_ID.includes("LovespyKeyID") ||
      KEY_ID === "rzp_test_LovespyKeyID" ||
      KEY_ID === "rzp_test_yourKeyId";
    let orderId = "";

    if (isMock) {
      orderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
      console.log(`[Razorpay Sandbox] Generated mock order ID: ${orderId} for amount: ₹${finalTotal}`);
    } else {
      try {
        const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: finalTotal * 100, // paise
            currency: "INR",
            receipt: `receipt_ls_${Date.now()}`,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("Razorpay Order API failure response:", errText);
          throw new Error(`Razorpay API returned status: ${response.status}`);
        }

        const data = await response.json();
        orderId = data.id;
      } catch (error) {
        console.warn("Failed to contact Razorpay. Falling back to sandbox order simulation.", error);
        orderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
        isMock = true;
      }
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      amount: finalTotal * 100, // in paise
      key_id: KEY_ID || "rzp_test_yourKeyId", // send to client so they can open Checkout SDK
      is_mock: isMock,
    });
  } catch (error: any) {
    console.error("Initiate Payment error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to initiate payment." }, { status: 500 });
  }
}
