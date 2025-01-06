// export function formatDate(dateString: string | null | undefined) {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat('ko-KR', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     }).format(date);
//}

export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replace(/\. /g, '-').replace('.', '');
}