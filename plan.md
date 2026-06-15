# Product Requirements Document (PRD)

## Product Name

Screenshot Studio OSS

Alternative Names:

* ShotForge
* StoreShot OSS
* AppScreenshot Studio
* ScreenCraft

---

# 1. Vision

Create the best free and open-source browser-based tool for generating professional App Store and Google Play screenshots.

The entire application runs in the browser with no backend required.

Users can:

* Upload app screenshots
* Apply professional templates
* Add marketing copy
* Use device mockups
* Export all required App Store sizes
* Save projects locally
* Work completely offline

---

# 2. Problem Statement

Current screenshot generation tools suffer from:

* Expensive subscriptions
* Watermarks
* Limited exports
* Vendor lock-in
* Cloud-only workflows
* Privacy concerns

Developers need a free, privacy-first solution that generates store-ready screenshots without requiring a server.

---

# 3. Goals

### Primary Goals

* Create App Store screenshots quickly
* Export all required store sizes
* Run entirely in browser
* Support offline usage
* Open source under MIT license

### Secondary Goals

* Community templates
* Plugin ecosystem
* Localization support
* Bulk screenshot generation

---

# 4. Non Goals (Version 1)

Not building:

* Team collaboration
* Real-time editing
* User accounts
* Cloud sync
* SaaS billing
* AI generation

These may be added later via optional plugins.

---

# 5. Target Users

## Indie Developers

Need screenshots for app submissions.

## Mobile App Agencies

Need to generate screenshots repeatedly.

## Freelance Designers

Need faster screenshot production.

## Open Source Maintainers

Need free tools for app releases.

---

# 6. Platform

### Supported

* Chrome
* Edge
* Firefox
* Safari

### Deployment

* GitHub Pages
* Cloudflare Pages
* Netlify
* Vercel

---

# 7. Core Features

## Feature 1: Project Management

### Create Project

User can:

* Create project
* Rename project
* Delete project
* Duplicate project

### Save Project

Stored locally using IndexedDB.

### Export Project

Format:

```json
{
  "version": 1,
  "screens": []
}
```

Extension:

```txt
.ssgproj
```

### Import Project

Restore previous work.

---

## Feature 2: Canvas Editor

### Canvas

Resizable workspace.

Default size:

```txt
1290 × 2796
```

### Supported Elements

#### Text

Properties:

* Font family
* Font size
* Weight
* Color
* Opacity
* Alignment
* Rotation

#### Images

Properties:

* Upload
* Resize
* Crop
* Rotate
* Opacity

#### Shapes

* Rectangle
* Circle
* Line
* Triangle

#### Background

* Solid color
* Gradient
* Image

---

## Feature 3: Layers

Layer panel similar to Figma.

Capabilities:

* Reorder
* Rename
* Hide
* Lock
* Duplicate
* Delete

Layer hierarchy:

```txt
Background
Title
Subtitle
Device
Screenshot
```

---

## Feature 4: Device Mockups

### Supported Devices

#### Apple

* iPhone 16 Pro Max
* iPhone 16 Pro
* iPhone 15
* iPhone 14
* iPad Pro

#### Android

* Pixel 9
* Pixel 8
* Galaxy S25

### Features

* Auto-fit screenshots
* Rotate mockups
* Scale mockups
* Shadow controls

---

## Feature 5: Template System

Templates are JSON-based.

### Categories

Productivity

Finance

Fitness

Education

Healthcare

Travel

Ecommerce

Social

Gaming

Utilities

### Template Structure

```json
{
  "id": "feature-template",
  "elements": []
}
```

### Initial Templates

Target:

```txt
20 templates
```

---

## Feature 6: Asset Library

Stores:

* Screenshots
* Logos
* Backgrounds
* Icons

Storage:

IndexedDB

Features:

* Upload
* Delete
* Replace
* Search

---

## Feature 7: Alignment Tools

### Align

* Left
* Center
* Right
* Top
* Middle
* Bottom

### Distribute

* Horizontal
* Vertical

### Smart Guides

Show snapping lines while moving elements.

---

## Feature 8: Export Engine

### Export Formats

PNG

JPEG

ZIP

### Quality

1x

2x

3x

### Transparent Background

Supported.

---

## Feature 9: App Store Presets

### Apple Sizes

6.9-inch

6.5-inch

5.5-inch

12.9-inch iPad

### Android

Phone

Tablet

### Export Workflow

Design once.

Generate all required sizes automatically.

---

## Feature 10: Auto Resize Engine

### Objective

Adapt design to multiple store resolutions.

### Scaling Rules

Scale:

* Position
* Font size
* Padding
* Margins
* Images

Maintain visual consistency.

---

## Feature 11: Multi-Screen Workflow

Project contains:

```txt
Screen 1
Screen 2
Screen 3
Screen 4
Screen 5
```

Features:

* Duplicate screen
* Reorder screen
* Bulk export

---

## Feature 12: Undo / Redo

Keyboard:

Ctrl+Z

Ctrl+Shift+Z

Store:

```txt
Past
Present
Future
```

History limit:

```txt
100 states
```

---

# 8. Future Features

## Bulk Generation

CSV import:

```csv
title,subtitle
Track Expenses,Stay Organized
Create Budgets,Save More
```

Automatically generates screens.

---

## Localization

Generate:

* English
* Bengali
* French
* German
* Spanish

---

## Plugin Marketplace

Plugins can:

* Add templates
* Add mockups
* Add exporters

---

## AI Plugin

Optional local AI support via:

* Ollama
* Llama
* Qwen

No cloud dependency required.

---

# 9. Technical Architecture

## Frontend

React

TypeScript

TanStack Router

Zustand

Tailwind CSS

---

## Canvas

Konva

React-Konva

---

## Local Storage

Dexie

IndexedDB

---

## Drag and Drop

dnd-kit

---

## Export

JSZip

FileSaver

---

## Icons

Lucide

---

## Fonts

Google Fonts

---

# 10. Data Architecture

## Project

```ts
Project
├── Metadata
├── Assets
├── Screens
└── Settings
```

## Screen

```ts
Screen
├── Width
├── Height
├── Background
└── Elements
```

## Element

```ts
Element
├── Text
├── Image
├── Shape
└── Device
```

---

# 11. Performance Requirements

Initial Load:

< 2 seconds

Canvas FPS:

60 FPS

Export:

< 5 seconds per screen

Project Size:

Up to 500 MB local assets

---

# 12. Accessibility

Keyboard navigation

Focus states

Screen reader labels

High contrast support

Dark mode

Light mode

---

# 13. Success Metrics

### V1 Success

* Generate screenshot
* Apply template
* Export PNG

### V2 Success

* Export all App Store sizes

### V3 Success

* Community template ecosystem

---

# 14. Release Roadmap

## Milestone 1

Canvas Engine

Text

Images

Export PNG

Estimated: 2 weeks

---

## Milestone 2

Device Mockups

Layers

Asset Library

Estimated: 2 weeks

---

## Milestone 3

Templates

Project Save/Load

Estimated: 2 weeks

---

## Milestone 4

App Store Export Presets

ZIP Export

Auto Resize

Estimated: 3 weeks

---

## Milestone 5

Plugin System

Localization

Community Templates

Estimated: 4 weeks

---

# Final Product Statement

A fully open-source, privacy-first, offline-capable App Store Screenshot Generator that runs entirely in the browser and enables developers to create professional App Store and Google Play screenshots without subscriptions, watermarks, or cloud dependencies.
