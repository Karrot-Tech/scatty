import { ScattyState } from '@scatty/shared';

// Light theme color palette - soft, welcoming, cotton-like feel
export const colors = {
  // Backgrounds
  background: {
    primary: '#FFF9FB',    // Soft pink-white
    secondary: '#FFF0F5',  // Lavender blush
    tertiary: '#F8F4FF',   // Light lavender
    card: '#FFFFFF',       // Pure white for cards
    overlay: 'rgba(255, 240, 245, 0.95)',
  },

  // Text
  text: {
    primary: '#4A4458',    // Soft dark purple
    secondary: '#7B6F8E',  // Muted purple
    muted: '#A99FBB',      // Light purple-gray
    inverse: '#FFFFFF',    // White text on colored backgrounds
  },

  // State colors - soft pastels
  state: {
    idle: '#C4B8D9',       // Soft lavender
    listening: '#7EC8E3',  // Soft sky blue
    thinking: '#FFD4A3',   // Soft peach
    speaking: '#98D9A8',   // Soft mint green
    looking: '#E8A4C4',    // Soft pink
  },

  // Fairy avatar colors - Artistic Pastel
  fairy: {
    skin: '#FFE9E0',       // Creamy peach skin
    skinShadow: '#FACCBA', // Soft coral shadow
    hair: '#FF9EB5',       // Bubblegum pink hair
    hairHighlight: '#FFD1DC', // Milky pink highlight
    hairShadow: '#E88CA3', // Darker pink depth
    dress: '#DCD0FF',      // Pale violet dress
    dressAccent: '#C9B1FF', // Richer violet accent
    wings: '#E0DEFF',      // Periwinkle/Lavender wings
    wingsAccent: '#C4C0FF', // Deeper lavender
    blush: '#FFB7B2',      // Soft salmon blush
    eyes: '#4B3F72',       // Deep indigo/purple eyes
    eyeHighlight: '#FFFFFF',
    eyeShine: '#DCD0FF',   // Lavender shine
    eyelash: '#3E345E',    // Dark violet lashes
    eyebrow: '#BFA6C4',    // Soft purple-taupe
    mouth: '#FF8DA1',      // Rose pink
    mouthHighlight: '#FFC4D0', // Soft pink highlight
    nose: '#E8C0B0',       // Subtle taupe-pink
    sparkle: '#FFFACD',    // Lemon chiffon
    sparkleAlt: '#FFD1DC', // Pastel pink
  },

  // Accents
  accent: {
    primary: '#B794D4',    // Soft purple
    secondary: '#7EC8E3',  // Soft blue
    success: '#98D9A8',    // Soft green
    error: '#F5A3A3',      // Soft red
    warning: '#FFD4A3',    // Soft orange
  },

  // UI elements
  ui: {
    border: '#E8DFF0',
    shadow: 'rgba(139, 107, 168, 0.15)',
    divider: '#F0E8F5',
    buttonPrimary: '#B794D4',
    buttonSecondary: '#F0E8F5',
  },
};

// Get state color helper
export const getStateColor = (state: ScattyState): string => {
  return colors.state[state] || colors.state.idle;
};

// Get darker version of state color for accents
export const getStateAccentColor = (state: ScattyState): string => {
  const accents: Record<ScattyState, string> = {
    idle: '#A99FBB',
    listening: '#5BB5D9',
    thinking: '#FFBE7A',
    speaking: '#7ACC8E',
    looking: '#D98AAF',
  };
  return accents[state] || accents.idle;
};
