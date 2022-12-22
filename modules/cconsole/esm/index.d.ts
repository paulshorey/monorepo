export declare const cconsoleInit: (options?: {
    logToCloud?: Record<string, Function> | undefined;
    disabled?: boolean | undefined;
    useTrace?: boolean | undefined;
    useColor?: boolean | undefined;
    separateTypes?: boolean | undefined;
}) => {
    updateOptions: (newOptions?: {
        logToCloud?: Record<string, Function> | undefined;
        disabled?: boolean | undefined;
        useTrace?: boolean | undefined;
        useColor?: boolean | undefined;
        separateTypes?: boolean | undefined;
    } | undefined) => void;
    disable: () => void;
    enable: () => void;
    log: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    trace: (message: string, ...args: any[]) => void;
    success: (message: string, ...args: any[]) => void;
    subtle: (message: string, ...args: any[]) => void;
    clear: () => void;
    time: (label: string) => void;
    table: (tabularData: any, properties?: string[] | undefined) => void;
    timeEnd: (label: string) => void;
    timeLog: (label: string, ...data: any[]) => void;
    assert: (condition?: boolean | undefined, message?: string | undefined, ...data: any[]) => void;
    count: (label?: string | undefined) => void;
    countReset: (label?: string | undefined) => void;
    dir: (item: any, options?: any) => void;
    dirxml: (value: any) => void;
    group: (label?: string | undefined, ...data: any[]) => void;
    groupCollapsed: (label?: string | undefined, ...data: any[]) => void;
    groupEnd: () => void;
    profile?: ((label?: string | undefined) => void) | undefined;
    profileEnd?: ((label?: string | undefined) => void) | undefined;
    timeStamp?: ((label?: string | undefined) => void) | undefined;
};
declare const _default: {
    updateOptions: (newOptions?: {
        logToCloud?: Record<string, Function> | undefined;
        disabled?: boolean | undefined;
        useTrace?: boolean | undefined;
        useColor?: boolean | undefined;
        separateTypes?: boolean | undefined;
    } | undefined) => void;
    disable: () => void;
    enable: () => void;
    log: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    trace: (message: string, ...args: any[]) => void;
    success: (message: string, ...args: any[]) => void;
    subtle: (message: string, ...args: any[]) => void;
    clear: () => void;
    time: (label: string) => void;
    table: (tabularData: any, properties?: string[] | undefined) => void;
    timeEnd: (label: string) => void;
    timeLog: (label: string, ...data: any[]) => void;
    assert: (condition?: boolean | undefined, message?: string | undefined, ...data: any[]) => void;
    count: (label?: string | undefined) => void;
    countReset: (label?: string | undefined) => void;
    dir: (item: any, options?: any) => void;
    dirxml: (value: any) => void;
    group: (label?: string | undefined, ...data: any[]) => void;
    groupCollapsed: (label?: string | undefined, ...data: any[]) => void;
    groupEnd: () => void;
    profile?: ((label?: string | undefined) => void) | undefined;
    profileEnd?: ((label?: string | undefined) => void) | undefined;
    timeStamp?: ((label?: string | undefined) => void) | undefined;
};
export default _default;
