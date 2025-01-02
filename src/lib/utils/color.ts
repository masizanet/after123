// 색상의 밝기를 계산하여 대비되는 텍스트 색상을 반환
export function getContrastTextColor(backgroundColor: string): string {
  // hex to rgb
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 상대적 휘도 계산 (YIQ 공식)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return yiq >= 128 ? '#000000' : '#FFFFFF';
} 