import { NextResponse } from "next/server";
import { getStoreSettings, setStoreSettings } from "@/lib/dbServer";
import { authenticateAdmin } from "@/lib/authServer";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Validate request is from authorized administrator
  const adminPayload = await authenticateAdmin(request);
  if (!adminPayload) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const newSettings = await request.json();
    await setStoreSettings(newSettings);
    return NextResponse.json({ success: true, message: "Settings updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

