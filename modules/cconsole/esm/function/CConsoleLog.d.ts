type boundContext = {
    sharedContext: {
        last_action?: string;
    };
    action: string;
    options: {
        disabled?: boolean;
        logToCloud?: {
            log?: (str: string) => void;
            info?: (str: string) => void;
            warn?: (str: string) => void;
            error?: (str: string) => void;
        };
        useTrace?: boolean;
        useColor?: boolean;
        separateTypes?: boolean;
    };
};
/**
 * Console logging with added features
 */
export default function (this: boundContext): void;
export {};
