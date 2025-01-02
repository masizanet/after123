interface PartyColor {
  main: string;
  light: string;
}

export const PARTY_COLORS: Record<string, PartyColor> = {
  '더불어민주당': {
    main: '#152484',
    light: '#686C84'
  },
  '국민의힘': {
    main: '#E61E2B',
    light: '#E6B4B7'
  },
  '조국혁신당': {
    main: '#0073CF',
    light: '#9BB8CF'
  },
  '개혁신당': {
    main: '#FF7210',
    light: '#FFDCC3'
  },
  '진보당': {
    main: '#D6001C',
    light: '#D6A1A8'
  },
  '기본소득당': {
    main: '#00D2C3',
    light: '#9ED2CE'
  },
  '사회민주당': {
    main: '#F58400',
    light: '#F5D9B8'
  }
};

export function getPartyColor(partyName: string): PartyColor {
  return PARTY_COLORS[partyName] || { main: '#666666', light: '#CCCCCC' };
} 