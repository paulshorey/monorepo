var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get as fetcher_get } from "../fetcher";
const CACHE_SECONDS = 360000;
export default (site) => __awaiter(void 0, void 0, void 0, function* () {
    let data = {};
    try {
        data = yield fetcher_get(`https://api.linkpreview.net/?key=bbd06238f76c782e6e6d8743255351be&q=${site}`, {
            ttl: CACHE_SECONDS
        });
    }
    catch (e) {
        console.error("Error getSitePreview()", e);
    }
    // siteName = siteName.replace('https://', '');
    // siteName = siteName.replace('http://', '');
    // siteName = siteName.replace('www.', '');
    return data || null;
});
