export default function str_insert(string = "", index = 0, insert = "") {
    return string.substring(0, index) + insert + string.substring(index, string.length);
}
