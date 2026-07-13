import { getStoreSettings, setStoreSettings } from "./dbServer";

// Helper to determine if we should run in simulated mode
export async function isShiprocketSimulated(): Promise<boolean> {
  const settings = await getStoreSettings();
  const email = settings.shiprocketEmail?.trim();
  const password = settings.shiprocketPassword?.trim();

  // If no credentials, or they are placeholders, run in simulated mode
  if (!email || !password) return true;
  if (email.includes("example") || email.includes("your-email") || email.includes("shipping@lovespy.in")) return true;
  if (password === "••••••••" || password.toLowerCase().includes("placeholder") || password.toLowerCase().includes("password")) return true;

  return false;
}

// Get Shiprocket Auth Token
export async function getShiprocketToken(): Promise<string> {
  const simulated = await isShiprocketSimulated();
  if (simulated) {
    return "simulated-token-lovespy-2026";
  }

  const settings = await getStoreSettings();
  
  // If we already have a cached token, we can check if it's usable,
  // but to be safe and avoid expiration issues, we can request a new one
  // or use the cached one if available. Let's try auth login.
  try {
    const res = await fetch("https://apiv2.shiprocket.in/v2/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: settings.shiprocketEmail,
        password: settings.shiprocketPassword
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket auth failed: ${errText}`);
    }

    const data = await res.json();
    if (data.token) {
      // Save token back to settings for future calls if needed
      await setStoreSettings({
        ...settings,
        shiprocketToken: data.token
      });
      return data.token;
    }
    throw new Error("No token returned from Shiprocket auth");
  } catch (error) {
    console.error("Error authenticating with Shiprocket:", error);
    // If auth fails but we have a cached token, fall back to it
    if (settings.shiprocketToken) {
      return settings.shiprocketToken;
    }
    throw error;
  }
}

// Create Order / Shipment in Shiprocket
export async function createShiprocketOrder(order: any): Promise<{ order_id: string; shipment_id: string }> {
  const simulated = await isShiprocketSimulated();
  if (simulated) {
    const randomOrderId = `SR-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomShipmentId = `SH-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      order_id: randomOrderId,
      shipment_id: randomShipmentId
    };
  }

  const token = await getShiprocketToken();

  // Map order items
  const items = (order.items || []).map((it: any, idx: number) => ({
    name: it.name || `Gift Item ${idx + 1}`,
    sku: it.id || `SKU-${idx + 1}`,
    units: it.qty || 1,
    selling_price: it.price || 0
  }));

  // Parse names
  const nameParts = (order.deliveryName || "Lovespy Customer").trim().split(/\s+/);
  const firstName = nameParts[0] || "Lovespy";
  const lastName = nameParts.slice(1).join(" ") || "Customer";

  // Build Shiprocket payload
  const payload = {
    order_id: order.orderNumber || `LS-${Date.now()}`,
    order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    pickup_location: "Primary", // Default pickup address nickname configured in Shiprocket
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.deliveryLine1 || order.address || "Address Line 1",
    billing_address_2: order.deliveryLine2 || "",
    billing_city: order.deliveryCity || "Delhi",
    billing_pincode: order.deliveryPincode || "110001",
    billing_state: order.deliveryState || "Delhi",
    billing_country: "India",
    billing_email: order.deliveryEmail || "customer@lovespy.in",
    billing_phone: order.deliveryPhone || "9999999999",
    shipping_is_billing: true,
    order_items: items,
    payment_method: "Prepaid",
    sub_total: order.subtotal || order.total || 0,
    length: 15,
    breadth: 15,
    height: 10,
    weight: 0.5
  };

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v2/auth/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket order creation failed: ${errText}`);
    }

    const data = await res.json();
    if (data.order_id && data.shipment_id) {
      return {
        order_id: String(data.order_id),
        shipment_id: String(data.shipment_id)
      };
    }
    throw new Error("Shiprocket did not return order_id and shipment_id");
  } catch (error) {
    console.error("Error creating Shiprocket order:", error);
    throw error;
  }
}

// Generate AWB & Assign Courier Partner
export async function generateShiprocketAWB(shipmentId: string): Promise<{ awb_code: string; courier_name: string }> {
  const simulated = await isShiprocketSimulated();
  if (simulated) {
    return {
      awb_code: `AWBSIM${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      courier_name: "Delhivery (Simulated Express)"
    };
  }

  const token = await getShiprocketToken();
  const payload = {
    shipment_id: Number(shipmentId)
  };

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v2/auth/courier/assign/awb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket AWB assignment failed: ${errText}`);
    }

    const data = await res.json();
    const awbData = data.awb_assign?.response?.data;
    if (awbData && awbData.awb_code) {
      return {
        awb_code: String(awbData.awb_code),
        courier_name: awbData.courier_name || "Shiprocket Courier"
      };
    }
    throw new Error("Shiprocket did not assign an AWB code");
  } catch (error) {
    console.error("Error generating Shiprocket AWB:", error);
    throw error;
  }
}

// Fetch Shipping Label PDF Link
export async function getShiprocketLabel(shipmentId: string): Promise<string> {
  const simulated = await isShiprocketSimulated();
  if (simulated) {
    return `/api/shiprocket/label?simulated=true&shipmentId=${shipmentId}`;
  }

  const token = await getShiprocketToken();
  const payload = {
    shipment_id: [Number(shipmentId)]
  };

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v2/auth/courier/generate/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket Label generation failed: ${errText}`);
    }

    const data = await res.json();
    if (data.label_url) {
      return data.label_url;
    }
    throw new Error("Shiprocket did not return a label_url");
  } catch (error) {
    console.error("Error fetching Shiprocket label:", error);
    throw error;
  }
}

// Track Shipment by AWB
export async function trackShiprocketAWB(awbCode: string): Promise<{ status: string; activities: any[] }> {
  const simulated = await isShiprocketSimulated();
  if (simulated) {
    // Generate mock status based on the awb string or just return random progressive statuses
    const statuses = ["Processing", "Packed", "Shipped", "In Transit", "Out For Delivery", "Delivered"];
    // Deterministic progression based on AWB code digits if possible, or just a default tracking trace
    return {
      status: "In Transit",
      activities: [
        { activity: "Order Confirmed", location: "Lovespy Hub", date: "2026-06-04 10:00:00" },
        { activity: "Processing", location: "Lovespy Warehouse", date: "2026-06-04 12:30:00" },
        { activity: "Packed", location: "Fulfillment Desk", date: "2026-06-04 14:00:00" },
        { activity: "Shipped", location: "Logistics Center", date: "2026-06-04 18:15:00" },
        { activity: "In Transit", location: "Transit Hub Delhi", date: "2026-06-04 22:40:00" }
      ]
    };
  }

  const token = await getShiprocketToken();
  try {
    const res = await fetch(`https://apiv2.shiprocket.in/v2/auth/courier/track/awb/${awbCode}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket tracking failed: ${errText}`);
    }

    const data = await res.json();
    const tracking = data.tracking_data;
    if (tracking && tracking.track_status === 1) {
      return {
        status: tracking.shipment_status || "Processing",
        activities: tracking.shipment_track_activities || []
      };
    }
    throw new Error("Shiprocket did not return tracking data");
  } catch (error) {
    console.error("Error tracking AWB:", error);
    throw error;
  }
}

// FUTURE REQUIREMENT: Fetch Invoice PDF Link
export async function getShiprocketInvoice(orderId: string): Promise<string> {
  const simulated = await isShiprocketSimulated();
  if (simulated) {
    return `/api/shiprocket/invoice?simulated=true&orderId=${orderId}`;
  }

  const token = await getShiprocketToken();
  const payload = {
    ids: [Number(orderId)]
  };

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v2/auth/orders/print/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket Invoice generation failed: ${errText}`);
    }

    const data = await res.json();
    if (data.invoice_url) {
      return data.invoice_url;
    }
    throw new Error("Shiprocket did not return an invoice_url");
  } catch (error) {
    console.error("Error fetching Shiprocket invoice:", error);
    throw error;
  }
}

// FUTURE REQUIREMENT: Create Return Order in Shiprocket
export async function createShiprocketReturn(order: any): Promise<{ return_order_id: string; return_shipment_id: string }> {
  const simulated = await isShiprocketSimulated();
  if (simulated) {
    return {
      return_order_id: `SR-RET-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
      return_shipment_id: `RET-SH-SIM-${Math.floor(100000 + Math.random() * 900000)}`
    };
  }

  const token = await getShiprocketToken();
  
  // Basic payload structure for return order creation
  const payload = {
    order_id: `RET-${order.orderNumber || Date.now()}`,
    order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    pickup_customer_name: order.deliveryName || "Customer",
    pickup_address: order.address || "Address Line 1",
    pickup_city: order.deliveryCity || "Delhi",
    pickup_pincode: order.deliveryPincode || "110001",
    pickup_state: order.deliveryState || "Delhi",
    pickup_country: "India",
    pickup_phone: order.deliveryPhone || "9999999999",
    shipping_customer_name: "Lovespy Returns",
    shipping_address: "Lovespy Fulfillment Center, Plot 44, Okhla Industrial Area Phase 3",
    shipping_city: "New Delhi",
    shipping_pincode: "110020",
    shipping_state: "Delhi",
    shipping_country: "India",
    shipping_phone: "8888888888",
    order_items: (order.items || []).map((it: any) => ({
      name: it.name,
      sku: it.id,
      units: it.qty,
      selling_price: it.price
    })),
    payment_method: "Prepaid",
    sub_total: order.subtotal || order.total || 0,
    length: 15,
    breadth: 15,
    height: 10,
    weight: 0.5
  };

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v2/auth/orders/create/return", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket return creation failed: ${errText}`);
    }

    const data = await res.json();
    if (data.order_id && data.shipment_id) {
      return {
        return_order_id: String(data.order_id),
        return_shipment_id: String(data.shipment_id)
      };
    }
    throw new Error("Shiprocket did not return return order_id and shipment_id");
  } catch (error) {
    console.error("Error creating Shiprocket return order:", error);
    throw error;
  }
}

