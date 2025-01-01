const isDevelopment = process.env.NODE_ENV === 'development';
export function logDebug(...args: unknown[]) {
    if (isDevelopment) {
        console.log(...args);
    }
}