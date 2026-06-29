import { NextRequest, NextResponse } from "next/server";

// Reference global in-memory map
const globalWithPaid = global as typeof globalThis & {
  paidOrders?: Map<string, string>;
};
globalWithPaid.paidOrders = globalWithPaid.paidOrders || new Map();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get("order_id");

    if (!order_id) {
      return NextResponse.json(
        { status: "error", message: "Parameter order_id wajib diisi." },
        { status: 400 }
      );
    }

    const isPaid = globalWithPaid.paidOrders!.get(order_id) === "PAID";

    if (isPaid) {
      // Consume the payment state (remove from memory so memory doesn't leak)
      globalWithPaid.paidOrders!.delete(order_id);
      return NextResponse.json({ status: "PAID" });
    }

    return NextResponse.json({ status: "PENDING" });
  } catch (err: any) {
    console.error("Gagal memeriksa status transaksi:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
