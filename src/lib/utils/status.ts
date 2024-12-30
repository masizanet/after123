export function getStatusClass(result: string | null): string {
    if (!result) return 'statusPending';
    if (result.includes('가결')) return 'statusPassed';
    if (result.includes('부결')) return 'statusRejected';
    return 'statusPending';
}