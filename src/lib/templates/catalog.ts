import { DEFAULT_DEVICE_ID } from '@/lib/constants'
import { buildBoldCentered } from '@/lib/templates/layouts/bold-centered'
import { buildClassicHero } from '@/lib/templates/layouts/classic-hero'
import { buildDarkGlow } from '@/lib/templates/layouts/dark-glow'
import { buildFeatureGraphic } from '@/lib/templates/layouts/feature-graphic'
import { buildFeatureCards } from '@/lib/templates/layouts/feature-cards'
import { buildMeshModern } from '@/lib/templates/layouts/mesh-modern'
import { buildMinimalLight } from '@/lib/templates/layouts/minimal-light'
import { buildSplitLeft } from '@/lib/templates/layouts/split-left'
import { buildSplitRight } from '@/lib/templates/layouts/split-right'
import { buildStoreAngledDevice } from '@/lib/templates/layouts/store-angled-device'
import { buildStoreBoldBrand } from '@/lib/templates/layouts/store-bold-brand'
import { buildStoreBottomHeadline } from '@/lib/templates/layouts/store-bottom-headline'
import { buildStoreTopHeadline } from '@/lib/templates/layouts/store-top-headline'
import type { LayoutBuildInput, LayoutBuildResult, TemplateDefinition } from '@/lib/templates/types'

function makeTemplate(
  id: string,
  name: string,
  category: TemplateDefinition['category'],
  layout: TemplateDefinition['layout'],
  tags: string[],
  input: LayoutBuildInput,
  builder: (input: LayoutBuildInput) => LayoutBuildResult,
  backgroundOverride?: LayoutBuildResult['background'],
): TemplateDefinition {
  const built = builder(input)
  return {
    id,
    name,
    category,
    layout,
    tags,
    background: backgroundOverride ?? built.background,
    elements: built.elements,
  }
}

/** Curated set: one unique layout each, bold typography, no duplicate structures */
export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  makeTemplate(
    'showcase-clutter-free',
    'Crystal Clarity',
    'showcase',
    'storeTopHeadline',
    ['showcase', 'minimal', 'modern'],
    {
      title: 'See Every\nDetail',
      subtitle: 'Pinch, zoom, and focus without distraction',
      accent: '#0d9488',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'black',
    },
    buildStoreTopHeadline,
  ),
  makeTemplate(
    'showcase-dark-mode',
    'Dual Theme',
    'showcase',
    'storeBottomHeadline',
    ['showcase', 'dark', 'modern'],
    {
      title: 'Dark Mode',
      subtitle: 'Switch themes without losing clarity',
      accent: '#0f172a',
      accentSecondary: '#0d9488',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'black',
    },
    buildStoreBottomHeadline,
  ),
  makeTemplate(
    'showcase-bold-brand',
    'Brand Statement',
    'showcase',
    'storeBoldBrand',
    ['showcase', 'bold', 'modern'],
    {
      title: 'Create.\nShare.\nInspire.',
      subtitle: '',
      accent: '#0d9488',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'white',
    },
    buildStoreBoldBrand,
  ),
  makeTemplate(
    'showcase-wellness-angled',
    'Gradient Angle',
    'showcase',
    'storeAngledDevice',
    ['showcase', 'bold', 'modern'],
    {
      title: 'Your Daily\nMomentum',
      subtitle: 'Track habits and celebrate progress',
      accent: '#06b6d4',
      accentSecondary: '#0d9488',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'black',
    },
    buildStoreAngledDevice,
  ),

  makeTemplate(
    'productivity-minimal',
    'Deep Focus',
    'productivity',
    'minimalLight',
    ['minimal', 'modern'],
    {
      title: 'Work In Flow',
      subtitle: 'Tasks, notes, and calendar without noise',
      accent: '#0d9488',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'natural',
    },
    buildMinimalLight,
  ),
  makeTemplate(
    'finance-dark-glow',
    'Money Clarified',
    'finance',
    'darkGlow',
    ['dark', 'bold', 'modern'],
    {
      title: 'Your Wealth,\nSimplified',
      subtitle: 'Budgets, bills, and insights in one view',
      accent: '#2dd4bf',
      accentSecondary: '#09090b',
      badge: 'Secure',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'black',
    },
    buildDarkGlow,
  ),
  makeTemplate(
    'fitness-bold',
    'Power Center',
    'fitness',
    'boldCentered',
    ['bold', 'modern'],
    {
      title: 'CRUSH YOUR\nGOALS',
      subtitle: 'Training zones, recovery, and streaks tracked',
      accent: '#f97316',
      accentSecondary: '#7c2d12',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'black',
      headlineFont: 'Oswald',
    },
    buildBoldCentered,
  ),
  makeTemplate(
    'education-cards',
    'Lesson Stack',
    'education',
    'featureCards',
    ['modern', 'bold'],
    {
      title: 'Learn On\nYour Terms',
      subtitle: 'Interactive lessons with instant feedback',
      accent: '#6366f1',
      accentSecondary: '#312e81',
      badge: 'NEW',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'white',
    },
    buildFeatureCards,
  ),
  makeTemplate(
    'healthcare-split',
    'Care Sync',
    'healthcare',
    'splitLeft',
    ['split', 'modern'],
    {
      title: 'Health In\nYour Hands',
      subtitle: 'Appointments, records, and reminders unified',
      accent: '#ccfbf1',
      accentSecondary: '#99f6e4',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'white',
    },
    buildSplitLeft,
  ),
  makeTemplate(
    'travel-mesh',
    'Sky Wander',
    'travel',
    'meshModern',
    ['modern', 'bold'],
    {
      title: 'Explore\nWithout Limits',
      subtitle: 'Trips, tickets, and itineraries in one place',
      accent: '#38bdf8',
      accentSecondary: '#0d9488',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'black',
    },
    buildMeshModern,
  ),
  makeTemplate(
    'ecommerce-split',
    'Instant Checkout',
    'ecommerce',
    'splitRight',
    ['split', 'bold', 'modern'],
    {
      title: 'Shop\nSmarter',
      subtitle: 'Curated picks with secure one-tap checkout',
      accent: '#f43f5e',
      accentSecondary: '#881337',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'black',
    },
    buildSplitRight,
  ),
  makeTemplate(
    'social-classic',
    'Social Pulse',
    'social',
    'classicHero',
    ['bold', 'modern'],
    {
      title: 'Share What\nMatters',
      subtitle: 'Stories, groups, and moments that connect',
      accent: '#ec4899',
      accentSecondary: '#831843',
      headlineFont: 'Poppins',
      deviceId: DEFAULT_DEVICE_ID,
      colorVariant: 'black',
    },
    buildClassicHero,
  ),
  makeTemplate(
    'utilities-feature-graphic',
    'Play Store Banner',
    'utilities',
    'featureGraphic',
    ['modern', 'bold'],
    {
      title: 'Your App\nOn Every Device',
      subtitle: 'Download today on Google Play',
      accent: '#0d9488',
      accentSecondary: '#115e59',
      badge: 'Featured on Google Play',
      headlineFont: 'Poppins',
    },
    buildFeatureGraphic,
  ),
]

export const TEMPLATES = TEMPLATE_CATALOG
