import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { order_id, amount, apiKey, project } = await req.json();

    if (!order_id || !amount) {
      return NextResponse.json(
        { status: "error", message: "Parameter order_id dan amount wajib diisi." },
        { status: 400 }
      );
    }

    const targetProject = process.env.PAKASIR_PROJECT || project || "depodomain";
    const targetApiKey = process.env.PAKASIR_API_KEY || apiKey || "demo_api_key";

    console.log(`Menghubungi Pakasir QRIS API untuk order_id: ${order_id}, amount: ${amount}`);

    const response = await fetch("https://app.pakasir.com/api/transactioncreate/qris", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        project: targetProject,
        order_id: order_id,
        amount: Number(amount),
        api_key: targetApiKey
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Error dari Pakasir API (HTTP ${response.status}):`, errText);
      return NextResponse.json(
        { status: "error", message: `Pakasir API Error: ${errText || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Gagal membuat transaksi Pakasir QRIS:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
