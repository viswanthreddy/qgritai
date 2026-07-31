import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDocumentScannerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

type ScanDocument = { id: string; storage_path: string; bucket_id: string; mime_type: string; file_name: string; scan_attempts: number };

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  let env: ReturnType<typeof getDocumentScannerEnv>;
  try { env = getDocumentScannerEnv(); } catch { return NextResponse.json({ error: "Document scanning is not configured." }, { status: 503 }); }
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient(env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.rpc("claim_documents_for_scan", { batch_size: 5 });
  if (error) return NextResponse.json({ error: "Unable to claim documents." }, { status: 500 });
  let clean = 0;
  let rejected = 0;
  for (const document of (data ?? []) as ScanDocument[]) {
    try {
      const { data: file, error: downloadError } = await supabase.storage.from(document.bucket_id).download(document.storage_path);
      if (downloadError || !file) throw new Error("Unable to read quarantined object.");
      const scanResponse = await fetch(env.DOCUMENT_SCANNER_URL, { method: "POST", headers: { Authorization: `Bearer ${env.DOCUMENT_SCANNER_SECRET}`, "Content-Type": document.mime_type, "X-File-Name": encodeURIComponent(document.file_name) }, body: file });
      if (!scanResponse.ok) throw new Error(`Scanner returned ${scanResponse.status}.`);
      const verdict = await scanResponse.json() as { clean?: boolean; signature?: string };
      if (verdict.clean === true) {
        const { error: cleanUploadError } = await supabase.storage.from("client-documents").upload(document.storage_path, file, { contentType: document.mime_type, upsert: false });
        if (cleanUploadError) throw new Error("Unable to promote clean object.");
        const { error: updateError } = await supabase.from("documents").update({ bucket_id: "client-documents", scan_status: "clean", scanned_at: new Date().toISOString(), scan_error: null }).eq("id", document.id);
        if (updateError) {
          await supabase.storage.from("client-documents").remove([document.storage_path]);
          throw new Error("Unable to mark document clean.");
        }
        await supabase.storage.from(document.bucket_id).remove([document.storage_path]);
        clean += 1;
      } else {
        const { error: rejectError } = await supabase.from("documents").update({ scan_status: "rejected", scanned_at: new Date().toISOString(), scan_error: verdict.signature?.slice(0, 500) || "Malware detected" }).eq("id", document.id);
        if (rejectError) throw new Error("Unable to record rejected document.");
        await supabase.storage.from(document.bucket_id).remove([document.storage_path]);
        rejected += 1;
      }
    } catch (scanError) {
      const retryMinutes = Math.min(60, 2 ** document.scan_attempts);
      await supabase.from("documents").update({ scan_status: "scan_failed", scan_error: scanError instanceof Error ? scanError.message.slice(0, 500) : "Unknown scanning error", next_scan_at: new Date(Date.now() + retryMinutes * 60_000).toISOString() }).eq("id", document.id);
    }
  }
  return NextResponse.json({ claimed: data?.length ?? 0, clean, rejected });
}
