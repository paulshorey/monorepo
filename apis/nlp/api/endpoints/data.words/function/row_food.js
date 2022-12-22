import arr_subtract from "@ps/fn/io/arrays/arrays_subtract";
export default function (row) {
    row.food = false;
    if (row.tlds[0].includes("cooking") ||
        row.tlds[0].includes("recipes") ||
        row.tlds[0].includes("restaurant") ||
        row.tlds[1].includes("cooking") ||
        row.tlds[1].includes("recipes") ||
        row.tlds[1].includes("restaurant")) {
        /*
         * flag for later use
         */
        row.food = true;
        /*
         * add some TLDs
         */
        row.tlds[1] = ["catering", "restaurant", "kitchen", "menu", "cooking", "recipes", "cafe", ...row.tlds[1]];
        row.tlds[1] = arr_subtract(row.tlds[1], row.tlds[0]);
        row.tlds[2] = arr_subtract(row.tlds[2], row.tlds[1]);
    }
}
