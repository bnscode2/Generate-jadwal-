import { NextRequest, NextResponse } from "next/server";

// Declare global in-memory map for tracking paid transactions in real-time
const globalWithPaid = global as typeof globalThis & {
  paidOrders?: Map<string, string>;
};
globalWithPaid.paidOrders = globalWithPaid.paidOrders || new Map();

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("Menerima webhook pembayaran Pakasir:", JSON.stringify(payload));

    // Pakasir callback fields: typically sends order_id and status/payment_status
    const order_id = payload.order_id || payload.external_id || payload.reference_id;
    const status = payload.status || payload.payment_status || "success"; // Default to success if callback is hit

    if (!order_id) {
      return NextResponse.json(
        { status: "error", message: "order_id tidak ditemukan dalam payload." },
        { status: 400 }
      );
    }

    // Check if status is successful/paid/settled/success
    const isPaid = ["success", "paid", "settlement", "completed", "berhasil"].includes(
      String(status).toLowerCase()
    );

    if (isPaid) {
      console.log(`PAGAR PEMBAYARAN: Transaksi ${order_id} berhasil dibayar!`);
      
      // Save to global in-memory map so frontend polling immediately detects it
      globalWithPaid.paidOrders!.set(order_id, "PAID");

      // Extract user ID from order_id formatted as: JADW_userId_timestamp
      if (order_id.startsWith("JADW_")) {
        const parts = order_id.split("_");
        const userId = parts[1];
        if (userId) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
          // Use service role key if available to bypass RLS, otherwise fallback to anon key
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
          
          if (supabaseUrl && supabaseServiceKey) {
            try {
              const { createClient } = await import("@supabase/supabase-js");
              const supabase = createClient(supabaseUrl, supabaseServiceKey);
              
              // Direct server-side admin upgrade bypassing RLS constraints
              const { error } = await supabase
                .from("profiles")
                .update({
                  is_pro: true,
                  activated_at: new Date().toISOString()
                })
                .eq("id", userId);

              if (error) {
                console.error(`Gagal mengupdate profile user ${userId} ke PRO di Supabase:`, error.message);
              } else {
                console.log(`SUKSES WEBHOOK: Akun user ${userId} telah diperbarui ke status PRO!`);
              }
            } catch (sbErr) {
              console.error("Kesalahan koneksi Supabase server-side di webhook:", sbErr);
            }
          } else {
            console.warn("Kredensial Supabase tidak lengkap untuk auto-update profile server-side.");
          }
        }
      }
    } else {
      console.log(`Webhook diterima untuk ${order_id} dengan status non-sukses: ${status}`);
    }

    return NextResponse.json({ status: "success", received: true });
  } catch (err: any) {
    console.error("Gagal memproses webhook Pakasir:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
