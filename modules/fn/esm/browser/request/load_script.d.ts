type Props = {
    /**
     * external URL to load
     */
    src: string;
    /**
     * object of attributes to add to the new <script> tag
     */
    scriptAttrs?: Record<string, string | number | boolean>;
};
/**
 * Load external script into html page
 */
export default function load_script({ src, scriptAttrs }: Props): false | Promise<unknown>;
export {};
