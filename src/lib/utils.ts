import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { FileTransfer } from "@capacitor/file-transfer";
import { FileOpener } from "@capacitor-community/file-opener";
import { Directory } from "@capacitor/filesystem";

export async function downloadAndOpenReceipt(pdfUrl: string, orderId: number): Promise<void> {

  try {
    const fileName = `receipt_${orderId}.pdf`;
    const targetPath = `${Directory.Documents}/${fileName}`;
    const downloadResult = await FileTransfer.downloadFile({ url: pdfUrl, path: targetPath });
    const savedPath = downloadResult.path ?? targetPath;
    await FileOpener.open({ filePath: savedPath, contentType: "application/pdf" });
    alert("✅ Receipt opened successfully!");
  } catch {
    alert("❌ Failed to download the receipt. Please check the file URL.");
  }
}

