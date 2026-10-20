import mcqueenBody from '../../assets/design/garage/mcqueen-body.webp'
import mcqueenEyes from '../../assets/design/garage/mcqueen-eyes.webp'
import flo from '../../assets/design/garage/hero-flo.webp'
import guido from '../../assets/design/garage/hero-guido.webp'
import mater from '../../assets/design/garage/hero-mater.webp'
import storm from '../../assets/design/garage/hero-storm.webp'
import aero from '../../assets/design/garage/wheels/aero.svg?raw'
import classic from '../../assets/design/garage/wheels/classic.svg?raw'
import gold from '../../assets/design/garage/wheels/gold.svg?raw'
import mesh from '../../assets/design/garage/wheels/mesh.svg?raw'
import neon from '../../assets/design/garage/wheels/neon.svg?raw'
import star from '../../assets/design/garage/wheels/star.svg?raw'

export const DISC_RADIUS = 58

export const HEROES = {
  hero_mcqueen: {
    image: mcqueenBody,
    eyes: mcqueenEyes,
    width: 704,
    height: 379,
    hue: 0,
    saturate: 1,
  },
  hero_mater: {
    image: mater,
    width: 422,
    height: 309,
    hue: 18,
    saturate: 1.6,
    wheels: [
      [205, 252, 26, 34, -6],
      [76, 236, 14, 28, -4],
      [388, 256, 13, 22, -4],
    ],
  },
  hero_flo: {
    image: flo,
    width: 725,
    height: 343,
    hue: 172,
    saturate: 1.3,
    wheels: [
      [268, 246, 38, 56, -6],
      [96, 232, 16, 30, -4],
    ],
  },
  hero_guido: {
    image: guido,
    width: 736,
    height: 981,
    hue: 210,
    saturate: 1.1,
    wheels: [[592, 890, 40, 52, -4]],
  },
  hero_storm: {
    image: storm,
    width: 663,
    height: 280,
    hue: 225,
    saturate: 2.2,
    wheels: [
      [214, 196, 38, 60, -8],
      [51, 150, 14, 50, -4],
    ],
  },
}

export const DEFAULT_HERO = 'hero_mcqueen'

const COLOR_HUES = {
  color_red: 0,
  color_yellow: 50,
  color_green: 120,
  color_blue: 215,
  color_violet: 275,
  color_rust: 28,
}

const GRAPHITE = 'grayscale(1) brightness(0.62) contrast(1.2)'

export function colorFilter(colorCode, hero) {
  if (colorCode === 'color_black') return GRAPHITE
  const target = COLOR_HUES[colorCode]
  if (target === undefined) return 'none'
  const rotate = (((target - hero.hue) % 360) + 360) % 360
  return `hue-rotate(${rotate}deg) saturate(${hero.saturate})`
}

const WHEEL_SOURCES = {
  wheels_stock: ['classic', classic],
  wheels_whitewall: ['aero', aero],
  wheels_lightyear: ['star', star],
  wheels_offroad: ['mesh', mesh],
  wheels_gold: ['gold', gold],
  wheels_neon: ['neon', neon],
}

export const NATIVE_WHEELS = 'wheels_stock'

const parsed = new Map()

function parseWheels(code) {
  if (parsed.has(code)) return parsed.get(code)
  const source = WHEEL_SOURCES[code]
  if (!source) return null
  const [style, raw] = source
  const markup = raw
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
    .replaceAll('rimShade', `rimShade-${style}`)
  const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  const defs = svg.querySelector('defs')?.outerHTML ?? ''
  const groups = [...svg.children].filter((node) => node.tagName === 'g')
  const result = {
    overlay: defs + groups.map((group) => group.outerHTML).join(''),
    defs,
    disc: groups[0]?.innerHTML ?? '',
  }
  parsed.set(code, result)
  return result
}

export function wheelsMarkup(wheelsCode, heroCode) {
  if (!wheelsCode || wheelsCode === NATIVE_WHEELS) return ''
  const wheels = parseWheels(wheelsCode)
  if (!wheels) return ''
  const hero = HEROES[heroCode]
  if (!hero.wheels) return wheels.overlay
  return (
    wheels.defs +
    hero.wheels
      .map(
        ([cx, cy, rx, ry, rotate]) =>
          `<g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${rx / DISC_RADIUS} ${ry / DISC_RADIUS})">${wheels.disc}</g>`,
      )
      .join('')
  )
}
