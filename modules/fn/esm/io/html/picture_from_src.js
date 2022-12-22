/**
 * Generate <picture> html tag string from src url. Fix crop/fill dimensions for Cloudinary.com resizer.
 *    WHENEVER POSSIBLE, pass 2 out of 3 props: width, height, or heightWidthRatio.
 *    "Sm" suffix refers to "small screens". Optionally, specify alternative props for mobile devices.
 * @param opt.src {string} - required, path to image (can be relative or absolute)
 * @param opt.srcSm {string} - for mobile
 *
 * @param opt.width {number} - required if !height, pixels
 * @param opt.widthSm {number} - for mobile
 *
 * @param opt.height {number} - required if !width, pixels
 * @param opt.heightSm {number} - for mobile
 *
 * @param opt.heightWidthRatio {number} - 0-1 (divide height by width)
 * @param opt.heightWidthRatioSm {number} - for mobile
 *
 * @param opt.crop {boolean} - by default, 100% of the picture height and width will be fitted inside the bounding box, with padding around the sides
 *    Pass true to fill 100% of the bounding box, and crop the image height/width, whichever dimension does not fit into the bounding box.
 */
export default function picture_from_src({ src = "", srcSm = "", width, widthSm, height, heightSm, heightWidthRatio, heightWidthRatioSm, crop = false }) {
    if (!src || (!width && !height)) {
        return null;
    }
    /*
     * Interpolate height/width/ratio variables from props.
     * WHENEVER POSSIBLE, pass 2 out of 3 props: width, height, or heightWidthRatio.
     * OTHERWISE, some returned properties will be undefined. Never use picture.width without checking if truthy.
     */
    if (width) {
        width = Math.round(width);
    }
    if (height) {
        height = Math.round(height);
    }
    if (!width && height && heightWidthRatio) {
        width = Math.round(height / heightWidthRatio);
    }
    if (!height && width && heightWidthRatio) {
        height = Math.round(width * heightWidthRatio);
    }
    if (!heightWidthRatio && width && height) {
        heightWidthRatio = height / width;
    }
    /*
     * MOBILE height/width
     * This will actually be LARGER than on desktop, becuase iPhone has 3x pixel density!
     * Full-width image (400px) on a 414px wide iPhone screen will be 1200px wide!
     * That's weird, but intentional, so graphics look crisp.
     */
    if (!heightWidthRatioSm && heightWidthRatio) {
        heightWidthRatioSm = heightWidthRatio;
    }
    if (!widthSm && heightSm && heightWidthRatioSm) {
        widthSm = Math.round(heightSm / heightWidthRatioSm);
    }
    if (!heightSm && widthSm && heightWidthRatioSm) {
        heightSm = Math.round(widthSm * heightWidthRatioSm);
    }
    if (!heightSm && height) {
        heightSm = Math.round((height / 3) * 2);
    }
    if (!widthSm && width) {
        widthSm = Math.round((width / 3) * 2);
    }
    if (!heightWidthRatioSm && heightSm && widthSm) {
        heightWidthRatioSm = Math.round(heightSm / widthSm);
    }
    // 414px wide iPhone screen, maximum image display size of 400px
    // if (widthSm && widthSm > 400) {
    // widthSm = 400;
    // if (!heightSm && heightWidthRatioSm && widthSm) {
    //   heightSm = Math.round(heightWidthRatioSm * widthSm);
    // }
    // }
    /*
     * PREVIEW width/height
     * This is the tiny blurry image that may load initially while waiting for full size image to download
     */
    let widthPreview = 19;
    let heightPreview = Math.round(widthPreview * (heightWidthRatio || 1));
    /*
     * OUTPUT format
     * Calculate all variants, sizes, and formats, to be used later in <picture> tag.
     * Multiply all heights/widths by 2x pixel density, to account for retina displays.
     */
    let picture = {
        src: src || "",
        src_sm: srcSm || src || "",
        src_preview: "",
        src_preview_sm: "",
        src_webp: "",
        src_webp_sm: "",
        type: "",
        type_sm: "",
        width,
        height,
        width_sm: widthSm || width,
        height_sm: widthSm ? heightSm : height
    };
    // c_mode
    let c_mode = !!crop ? "c_fill,g_auto" : "c_pad";
    // make <picture><source> attributes from src
    if (src.includes("cloudinary.com")) {
        src = src.replace(/\.svg$/, ".png");
        if (srcSm)
            srcSm = srcSm.replace(/\.svg$/, ".png");
        src = src.replace("http://", "https://");
        // remove version
        src = src.replace(/v[0-9]{9,}/, "");
        // remove width/height/crop, because we'll add our own crop
        src = src.replace(/\/[a-z]_[^/]+/, "");
        // regex
        let srcReplace = "/images/";
        if (src.includes("/image/upload/")) {
            srcReplace = "/image/upload/";
        }
        const srcRe = new RegExp(`${srcReplace}`); // the .*?/ bit is to remove preexisting url transformations
        // resize to specified size
        // multiplying height and width * 2x pixel density, to account for retina displays
        // multiplying heightSm and widthSm * 3x, because new iPhones have 3x pixel density
        if (width && !height) {
            picture.src = src.replace(srcRe, `${srcReplace}w_${Math.floor(width * 2)}/`);
            picture.src_preview = src.replace(srcRe, `${srcReplace}w_${widthPreview},${c_mode}/`);
            // for mobile
            if (widthSm) {
                let widthSmX = widthSm < 500 ? Math.floor(widthSm * 3) : Math.floor(widthSm * 2);
                picture.src_sm = (srcSm || src).replace(srcRe, `${srcReplace}w_${widthSmX}/`);
            }
        }
        else if (height && !width) {
            picture.src = src.replace(srcRe, `${srcReplace}${"h_" + Math.floor(height * 2)}/`);
            picture.src_preview = src.replace(srcRe, `${srcReplace}h_${heightPreview}/`);
            // for mobile
            if (heightSm) {
                let heightSmX = heightSm < 500 ? Math.floor(heightSm * 3) : Math.floor(heightSm * 2);
                picture.src_sm = (srcSm || src).replace(srcRe, `${srcReplace}h_${heightSmX}/`);
            }
        }
        else if (width && height) {
            picture.src = src.replace(srcRe, `${srcReplace}w_${Math.floor(width * 2)},h_${Math.floor(height * 2)},${c_mode}/`);
            picture.src_preview = src.replace(srcRe, `${srcReplace}w_${widthPreview},h_${heightPreview},${c_mode}/`);
            picture.src_preview_sm = (srcSm || src).replace(srcRe, `${srcReplace}w_${widthPreview},h_${heightPreview},${c_mode}/`);
            // for mobile
            if (widthSm && heightSm) {
                let widthSmX = widthSm < 500 ? Math.floor(widthSm * 3) : Math.floor(widthSm * 2);
                let heightSmX = widthSm < 500 ? Math.floor(heightSm * 3) : Math.floor(heightSm * 2);
                picture.src_sm = (srcSm || src).replace(srcRe, `${srcReplace}w_${widthSmX},h_${heightSmX},${c_mode}/`);
            }
        }
        // webp
        {
            let { rext, type } = srcMeta(picture.src);
            picture.type = type;
            picture.type_sm = type;
            if (rext) {
                picture.src_webp = picture.src.replace(rext, ".webp");
                picture.src_webp_sm = picture.src_sm.replace(rext, ".webp");
            }
        }
    }
    return picture;
}
function srcMeta(src) {
    let meta = {};
    if (src.includes(".jpeg")) {
        meta.ext = ".jpeg";
        meta.type = "image/jpeg";
    }
    else if (src.includes(".jpg")) {
        meta.ext = ".jpg";
        meta.type = "image/jpeg";
    }
    else if (src.includes(".png")) {
        meta.ext = ".png";
        meta.type = "image/png";
    }
    else if (src.includes(".gif")) {
        meta.ext = ".gif";
        meta.type = "image/gif";
    }
    else if (src.includes(".webp")) {
        meta.ext = ".webp";
        meta.type = "image/webp";
    }
    else if (src.includes(".tiff")) {
        meta.ext = ".tiff";
        meta.type = "image/tiff";
    }
    else if (src.includes(".ico")) {
        meta.ext = ".ico";
        meta.type = "image/ico";
    }
    else if (src.includes(".svg")) {
        meta.ext = ".svg";
        meta.type = "image/svg";
    }
    if (meta.ext) {
        meta.rext = new RegExp(meta.ext, "i"); // must be case-insensitive search!
    }
    return meta;
}
