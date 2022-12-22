export default function base64_decode(str) {
    try {
        return Buffer.from(str, "base64").toString("ascii");
    }
    catch (_a) {
        return "";
    }
}
