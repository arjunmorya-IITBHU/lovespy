import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbServer";
import KeyValueStoreModel from "@/models/KeyValueStore";

export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ success: true, data: {} });
    }

    const items = await KeyValueStoreModel.find({});
    const dataMap: Record<string, any> = {};
    items.forEach((item) => {
      dataMap[item.key] = item.value;
    });

    return NextResponse.json({ success: true, data: dataMap });
  } catch (error: any) {
    console.error("Failed to fetch DB state from MongoDB:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ success: false, error: "Missing key." }, { status: 400 });
    }

    const conn = await dbConnect();
    if (conn) {
      await KeyValueStoreModel.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, message: "Sync successful." });
  } catch (error: any) {
    console.error("Failed to sync key to MongoDB:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
