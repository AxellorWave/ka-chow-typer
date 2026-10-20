export const DEFAULT_CAR_CONFIG = {
  hero: 'hero_mcqueen',
  color: 'color_native',
  decal: 'decal_bolt',
  wheels: 'wheels_stock',
  spoiler: 'spoiler_none',
}

export const withDefaults = (config) => ({ ...DEFAULT_CAR_CONFIG, ...config })
