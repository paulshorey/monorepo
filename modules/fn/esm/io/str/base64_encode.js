export default function base64_encode(str) {
    try {
        return Buffer.from(str).toString("base64");
    }
    catch (_a) {
        return "";
    }
}
