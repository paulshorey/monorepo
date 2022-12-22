type InputType = {
    src: string;
    width?: number;
    height?: number;
    heightWidthRatio?: number;
    srcSm?: string;
    widthSm?: number;
    heightSm?: number;
    heightWidthRatioSm?: number;
    crop?: boolean;
};
type OutputType = {
    src: string;
    src_sm: string;
    src_preview: string;
    src_preview_sm: string;
    src_webp: string;
    src_webp_sm: string;
    type: string;
    type_sm: string;
    width?: number;
    height?: number;
    width_sm?: number;
    height_sm?: number;
} | null;
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
export default function picture_from_src({ src, srcSm, width, widthSm, height, heightSm, heightWidthRatio, heightWidthRatioSm, crop }: InputType): OutputType;
export {};
