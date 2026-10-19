export const CAR_COLORS = {
  color_red: 'var(--car-red)',
  color_yellow: 'var(--car-yellow)',
  color_blue: 'var(--car-blue)',
  color_rust: 'var(--car-rust)',
  color_black: 'var(--car-black)',
}

export const carColor = (config) => CAR_COLORS[config?.color] ?? CAR_COLORS.color_red
