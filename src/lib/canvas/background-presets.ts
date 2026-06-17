import type { BackgroundConfig, PatternKind } from '@/lib/types'
import { BRAND_PRIMARY } from '@/lib/constants'

export interface BackgroundPreset {
  id: string
  label: string
  background: BackgroundConfig
}

function linear(angle: number, ...colors: string[]): BackgroundConfig {
  return {
    type: 'linear-gradient',
    gradient: {
      type: 'linear',
      angle,
      stops: colors.map((color, index) => ({
        offset: colors.length === 1 ? 0 : index / (colors.length - 1),
        color,
      })),
    },
  }
}

function mesh(colors: string[]): BackgroundConfig {
  return { type: 'mesh', color: '#0f172a', meshColors: colors }
}

function glass(angle: number, start: string, mid: string, end: string): BackgroundConfig {
  return {
    type: 'linear-gradient',
    gradient: {
      type: 'linear',
      angle,
      stops: [
        { offset: 0, color: start },
        { offset: 0.5, color: mid },
        { offset: 1, color: end },
      ],
    },
  }
}

function pattern(
  patternKind: PatternKind,
  color: string,
  patternColor: string,
  patternScale: number,
): BackgroundConfig {
  return { type: 'pattern', patternKind, color, patternColor, patternScale }
}

export const GRADIENT_PRESETS: BackgroundPreset[] = [
  { id: 'indigo', label: 'Teal', background: linear(145, BRAND_PRIMARY, '#1c1917') },
  { id: 'sunset', label: 'Sunset', background: linear(160, '#ff7e5f', '#feb47b') },
  { id: 'ocean', label: 'Ocean', background: linear(150, '#2193b0', '#6dd5ed') },
  { id: 'grape', label: 'Grape', background: linear(160, '#8e2de2', '#4a00e0') },
  { id: 'mint', label: 'Mint', background: linear(150, '#11998e', '#38ef7d') },
  { id: 'peach', label: 'Peach', background: linear(160, '#ed4264', '#ffedbc') },
  { id: 'midnight', label: 'Midnight', background: linear(160, '#232526', '#414345') },
  { id: 'rose', label: 'Rose', background: linear(150, '#ec008c', '#fc6767') },
  { id: 'aurora', label: 'Aurora', background: linear(135, '#667eea', '#764ba2') },
  { id: 'electric', label: 'Electric', background: linear(145, '#4776e6', '#8e54e9') },
  { id: 'cosmos', label: 'Cosmos', background: linear(160, '#0f0c29', '#302b63') },
  { id: 'cotton', label: 'Cotton', background: linear(135, '#a8edea', '#fed6e3') },
  { id: 'gold', label: 'Gold', background: linear(160, '#f7971e', '#ffd200') },
  { id: 'flamingo', label: 'Flamingo', background: linear(150, '#fa709a', '#fee140') },
  { id: 'blush', label: 'Blush', background: linear(150, '#ff9a9e', '#fad0c4') },
  { id: 'arctic', label: 'Arctic', background: linear(180, '#e0eafc', '#cfdef3') },
  { id: 'ember', label: 'Ember', background: linear(160, '#ff416c', '#ff4b2b') },
  { id: 'twilight', label: 'Twilight', background: linear(145, '#8360c3', '#2ebf91') },
  { id: 'navy', label: 'Navy', background: linear(160, '#141e30', '#243b55') },
  { id: 'lime', label: 'Lime', background: linear(150, '#a8ff78', '#78ffd6') },
  { id: 'slate', label: 'Slate', background: linear(160, '#64748b', '#0f172a') },
  { id: 'orchid', label: 'Orchid', background: linear(135, '#cc2b5e', '#753a88') },
  { id: 'sky', label: 'Sky', background: linear(180, '#89f7fe', '#66a6ff') },
  { id: 'wine', label: 'Wine', background: linear(150, '#200122', '#6f0000') },
]

export const MESH_PRESETS: BackgroundPreset[] = [
  { id: 'mesh-aurora', label: 'Aurora', background: mesh([BRAND_PRIMARY, '#ec4899', '#22d3ee', '#1c1917']) },
  { id: 'mesh-candy', label: 'Candy', background: mesh(['#f472b6', '#a78bfa', '#fbbf24', '#1e1b4b']) },
  { id: 'mesh-forest', label: 'Forest', background: mesh(['#10b981', '#34d399', '#065f46', '#022c22']) },
  { id: 'mesh-dusk', label: 'Dusk', background: mesh(['#f59e0b', '#ef4444', '#7c3aed', '#111827']) },
]

export const GLASS_PRESETS: BackgroundPreset[] = [
  { id: 'glass-frost', label: 'Frost', background: glass(135, '#e0e7ff', '#f5f3ff', '#cffafe') },
  { id: 'glass-smoke', label: 'Smoke', background: glass(135, '#334155', '#1e293b', '#0f172a') },
  { id: 'glass-pearl', label: 'Pearl', background: glass(145, '#ffffff', '#f8fafc', '#e2e8f0') },
  { id: 'glass-sand', label: 'Sand', background: glass(135, '#f5f7fa', '#e8edf2', '#c3cfe2') },
  { id: 'glass-crystal', label: 'Crystal', background: glass(160, '#eef2ff', '#f8fafc', '#e0f2fe') },
  { id: 'glass-blush', label: 'Blush', background: glass(150, '#fff1f2', '#fce7f3', '#fdf2f8') },
  { id: 'glass-lavender', label: 'Lavender', background: glass(135, '#ede9fe', '#f5f3ff', '#dbeafe') },
  { id: 'glass-mint', label: 'Mint', background: glass(150, '#ecfdf5', '#d1fae5', '#ccfbf1') },
  { id: 'glass-sky', label: 'Sky', background: glass(180, '#e0f2fe', '#f0f9ff', '#dbeafe') },
  { id: 'glass-honey', label: 'Honey', background: glass(160, '#fffbeb', '#fef3c7', '#fde68a') },
  { id: 'glass-aurora', label: 'Aurora', background: glass(135, '#e0e7ff', '#fae8ff', '#cffafe') },
  { id: 'glass-rose', label: 'Rose', background: glass(150, '#fef3c7', '#fde68a', '#fecdd3') },
  { id: 'glass-slate', label: 'Slate', background: glass(145, '#64748b', '#334155', '#1e293b') },
  { id: 'glass-midnight', label: 'Midnight', background: glass(160, '#1e293b', '#0f172a', '#020617') },
  { id: 'glass-obsidian', label: 'Obsidian', background: glass(145, '#374151', '#1f2937', '#111827') },
  { id: 'glass-indigo', label: 'Indigo', background: glass(135, '#4338ca', '#312e81', '#1e1b4b') },
]

export const PATTERN_PRESETS: BackgroundPreset[] = [
  {
    id: 'pattern-dots',
    label: 'Dots',
    background: pattern('dots', '#1c1917', BRAND_PRIMARY, 28),
  },
  {
    id: 'pattern-grid',
    label: 'Grid',
    background: pattern('grid', '#0f172a', '#334155', 40),
  },
  {
    id: 'pattern-diagonal',
    label: 'Stripes',
    background: pattern('diagonal', '#1e1b4b', '#312e81', 32),
  },
  {
    id: 'pattern-crosshatch',
    label: 'Crosshatch',
    background: pattern('crosshatch', '#0f172a', '#1e293b', 28),
  },
  {
    id: 'pattern-checker',
    label: 'Checker',
    background: pattern('checker', '#0f172a', '#111827', 48),
  },
  {
    id: 'pattern-triangles',
    label: 'Geometry',
    background: pattern('triangles', '#1c1917', BRAND_PRIMARY, 56),
  },
  { id: 'pattern-dots-cyan', label: 'Cyber', background: pattern('dots', '#020617', '#22d3ee', 24) },
  { id: 'pattern-dots-rose', label: 'Bloom', background: pattern('dots', '#18181b', '#f472b6', 26) },
  { id: 'pattern-dots-fine', label: 'Pinpoint', background: pattern('dots', '#0f172a', '#64748b', 16) },
  { id: 'pattern-dots-light', label: 'Mist', background: pattern('dots', '#f8fafc', '#cbd5e1', 22) },
  { id: 'pattern-grid-blueprint', label: 'Blueprint', background: pattern('grid', '#0a1628', '#1d4ed8', 36) },
  { id: 'pattern-grid-minimal', label: 'Minimal', background: pattern('grid', '#fafafa', '#e4e4e7', 32) },
  { id: 'pattern-diagonal-mint', label: 'Mint', background: pattern('diagonal', '#022c22', '#34d399', 28) },
  { id: 'pattern-diagonal-copper', label: 'Copper', background: pattern('diagonal', '#1c1917', '#f97316', 30) },
  { id: 'pattern-cross-violet', label: 'Mesh', background: pattern('crosshatch', '#0f0a1a', '#8b5cf6', 24) },
  { id: 'pattern-cross-emerald', label: 'Weave', background: pattern('crosshatch', '#042f2e', '#2dd4bf', 26) },
  { id: 'pattern-checker-tile', label: 'Tile', background: pattern('checker', '#18181b', '#27272a', 40) },
  { id: 'pattern-checker-lilac', label: 'Lilac', background: pattern('checker', '#1e1b4b', '#4338ca', 44) },
  { id: 'pattern-triangles-facet', label: 'Facet', background: pattern('triangles', '#0f172a', '#475569', 48) },
  { id: 'pattern-triangles-prism', label: 'Prism', background: pattern('triangles', '#09090b', BRAND_PRIMARY, 52) },
  { id: 'pattern-noise-film', label: 'Film', background: pattern('noise', '#171717', '#525252', 20) },
  { id: 'pattern-noise-paper', label: 'Paper', background: pattern('noise', '#fafaf9', '#d6d3d1', 18) },
  { id: 'pattern-dots-gold', label: 'Gilded', background: pattern('dots', '#0c0a09', '#fbbf24', 30) },
  { id: 'pattern-grid-slate', label: 'Graph', background: pattern('grid', '#111827', '#4b5563', 28) },
]

export const PATTERN_KINDS: PatternKind[] = [
  'dots',
  'grid',
  'diagonal',
  'crosshatch',
  'checker',
  'triangles',
  'noise',
]

export const ALL_BACKGROUND_PRESETS: { title: string; presets: BackgroundPreset[] }[] = [
  { title: 'Gradients', presets: GRADIENT_PRESETS },
  { title: 'Mesh', presets: MESH_PRESETS },
  { title: 'Glass', presets: GLASS_PRESETS },
  { title: 'Patterns', presets: PATTERN_PRESETS },
]
