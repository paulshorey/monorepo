export default function base64_encode(str: string): string {
  try {
    return Buffer.from(str).toString("base64");
  } catch {
    return "";
  }
}
