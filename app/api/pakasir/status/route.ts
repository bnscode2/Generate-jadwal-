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

    // Direct polling fallback to Pakasir API if not found in memory
    const amount = searchParams.get("amount");
    const project = searchParams.get("project");
    const targetProject = process.env.PAKASIR_PROJECT || project || "depodomain";
    const targetApiKey = process.env.PAKASIR_API_KEY || "demo_api_key";

    if (amount && targetApiKey && targetProject) {
      try {
        console.log(`Polling langsung ke Pakasir API untuk order_id: ${order_id}, project: ${targetProject}`);
        const checkUrl = `https://app.pakasir.com/api/transactiondetail?project=${targetProject}&amount=${amount}&order_id=${order_id}&api_key=${targetApiKey}`;
        const checkResponse = await fetch(checkUrl);
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          const pStatus = checkData.transaction?.status || checkData.status;
          console.log(`Hasil polling langsung untuk ${order_id}:`, pStatus);

          const isPaidDirect = ["success", "paid", "settlement", "completed", "berhasil"].includes(
            String(pStatus).toLowerCase()
          );

          if (isPaidDirect) {
            console.log(`SUKSES POLLING DIRECT: Transaksi ${order_id} terdeteksi PAID via Pakasir API!`);

            // Auto-update status user ke PRO di database Supabase (bypassing webhook delay)
            if (order_id.startsWith("JADW_")) {
              const parts = order_id.split("_");
              const userId = parts[1];
              if (userId) {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
                const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
                if (supabaseUrl && supabaseServiceKey) {
                  const { createClient } = await import("@supabase/supabase-js");
                  const supabase = createClient(supabaseUrl, supabaseServiceKey);
                  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

                  if (isUuid) {
                    const { error } = await supabase
                      .from("profiles")
                      .update({ is_pro: true, activated_at: new Date().toISOString() })
                      .eq("id", userId);
                    if (error) console.error("Gagal update profile via polling fallback:", error.message);
                  } else {
                    const { data: allProfiles } = await supabase.from("profiles").select("id, email");
                    if (allProfiles) {
                      const matchedProfile = allProfiles.find(
                        p => p.email?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === userId.toLowerCase()
                      );
                      if (matchedProfile) {
                        const { error } = await supabase
                          .from("profiles")
                          .update({ is_pro: true, activated_at: new Date().toISOString() })
                          .eq("id", matchedProfile.id);
                        if (error) console.error("Gagal update profile manual email via polling fallback:", error.message);
                      }
                    }
                  }
                }
              }
            }

            return NextResponse.json({ status: "PAID" });
          }
        }
      } catch (err: any) {
        console.error("Gagal polling langsung ke Pakasir API:", err);
      }
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
