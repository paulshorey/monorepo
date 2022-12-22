export default function base64_decode(str: string): string {
  try {
    return Buffer.from(str, "base64").toString("ascii");
  } catch {
    return "";
  }
}
