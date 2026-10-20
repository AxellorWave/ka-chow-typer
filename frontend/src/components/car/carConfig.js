export const DEFAULT_CAR_CONFIG = {
  color: 'color_red',
  decal: 'decal_bolt',
  wheels: 'wheels_stock',
  spoiler: 'spoiler_none',
}

export const withDefaults = (config) => ({ ...DEFAULT_CAR_CONFIG, ...config })
