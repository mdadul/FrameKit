import type { BackgroundConfig, ElementType } from '@/lib/types'

export type TemplateLayoutId =
  | 'classicHero'
  | 'splitRight'
  | 'splitLeft'
  | 'meshModern'
  | 'minimalLight'
  | 'darkGlow'
  | 'featureCards'
  | 'boldCentered'
  | 'storeTopHeadline'
  | 'storeBottomHeadline'
  | 'storeBoldBrand'
  | 'storeAngledDevice'
  | 'featureGraphic'

export const LAYOUT_LABELS: Record<TemplateLayoutId, string> = {
  classicHero: 'Classic Hero',
  splitRight: 'Split · Copy Right',
  splitLeft: 'Split · Copy Left',
  meshModern: 'Mesh · Modern',
  minimalLight: 'Minimal · Light',
  darkGlow: 'Dark · Glow',
  featureCards: 'Feature Cards',
  boldCentered: 'Bold · Centered',
  storeTopHeadline: 'App Store · Top Headline',
  storeBottomHeadline: 'App Store · Feature Compare',
  storeBoldBrand: 'App Store · Bold Brand',
  storeAngledDevice: 'App Store · Angled Device',
  featureGraphic: 'Play Store · Feature Graphic',
}

export type TemplateCategory =
  | 'productivity'
  | 'finance'
  | 'fitness'
  | 'education'
  | 'healthcare'
  | 'travel'
  | 'ecommerce'
  | 'social'
  | 'gaming'
  | 'utilities'
  | 'showcase'

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'showcase',
  'productivity',
  'finance',
  'fitness',
  'education',
  'healthcare',
  'travel',
  'ecommerce',
  'social',
  'gaming',
  'utilities',
]

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  showcase: 'App Store Showcase',
  productivity: 'Productivity',
  finance: 'Finance',
  fitness: 'Fitness & Health',
  education: 'Education',
  healthcare: 'Healthcare',
  travel: 'Travel',
  ecommerce: 'E-commerce',
  social: 'Social',
  gaming: 'Gaming',
  utilities: 'Utilities',
}

export const TEMPLATE_FILTER_TAGS = [
  'showcase',
  'minimal',
  'dark',
  'bold',
  'split',
  'modern',
  'classic',
] as const

export type TemplateElement = Record<string, unknown> & { type: ElementType; name?: string }

export interface LayoutBuildInput {
  title: string
  subtitle: string
  accent: string
  accentSecondary?: string
  deviceId?: string
  colorVariant?: string
  badge?: string
  headlineFont?: string
  subtitleFont?: string
  features?: [string, string, string]
  rating?: string
}

export interface LayoutBuildResult {
  background: BackgroundConfig
  elements: TemplateElement[]
}

export interface TemplateDefinition {
  id: string
  name: string
  category: TemplateCategory
  layout: TemplateLayoutId
  tags?: string[]
  background: BackgroundConfig
  elements: TemplateElement[]
}
