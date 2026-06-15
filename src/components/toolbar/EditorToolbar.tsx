import { useState } from 'react'
import type { ComponentType } from 'react'
import { Link } from '@tanstack/react-router'
import * as Popover from '@radix-ui/react-popover'
import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalDistributeCenter,
  AlignHorizontalJustifyCenter,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignVerticalDistributeCenter,
  AlignVerticalJustifyCenter,
  BringToFront,
  ChevronDown,
  Circle,
  Download,
  LayoutGrid,
  Minus,
  Plus,
  Redo2,
  SendToBack,
  Settings,
  Smartphone,
  Square,
  Triangle,
  Type,
  Undo2,
} from 'lucide-react'
import { DEVICES } from '@/lib/assets/devices'
import { useHistoryNavigation } from '@/hooks/useHistoryNavigation'
import { APP_NAME } from '@/lib/constants'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { ExportDialog } from '@/components/toolbar/ExportDialog'
import { SettingsDialog } from '@/components/settings/SettingsDialog'
import { KeyboardShortcutsDialog } from '@/components/settings/KeyboardShortcutsDialog'
import { BrandWordmark } from '@/components/ui/BrandWordmark'
import { BrandMark } from '@/components/ui/BrandMark'
import { ToolbarTooltipButton } from '@/components/ui/ToolbarTooltipButton'
import { InlineEdit } from '@/components/ui/InlineEdit'
import { SaveStatus } from '@/components/ui/SaveStatus'
import { ScreenSwitcher } from '@/components/toolbar/ScreenSwitcher'
import { ProjectMenu } from '@/components/toolbar/ProjectMenu'

type IconType = ComponentType<{ size?: number | string }>

interface ToolButtonProps {
  icon: IconType
  label: string
  onClick: () => void
}

function InsertMenuItem({ icon: Icon, label, onClick }: ToolButtonProps) {
  return (
    <Popover.Close asChild>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
      >
        <Icon size={16} />
        <span>{label}</span>
      </button>
    </Popover.Close>
  )
}

function ToolbarDivider() {
  return <div className="mx-0.5 hidden h-6 w-px shrink-0 bg-border sm:block" aria-hidden />
}

function IconButton({
  icon: Icon,
  label,
  ariaLabel,
  onClick,
  disabled,
}: {
  icon: IconType
  label: string
  ariaLabel?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <ToolbarTooltipButton
      icon={Icon}
      label={label}
      ariaLabel={ariaLabel}
      onClick={onClick}
      disabled={disabled}
    />
  )
}

export function EditorToolbar() {
  const project = useProjectStore((state) => state.project)
  const setProjectName = useProjectStore((state) => state.setProjectName)
  const addText = useProjectStore((state) => state.addText)
  const addShape = useProjectStore((state) => state.addShape)
  const addDevice = useProjectStore((state) => state.addDevice)
  const alignElements = useProjectStore((state) => state.alignElements)
  const alignToArtboard = useProjectStore((state) => state.alignToArtboard)
  const distributeElements = useProjectStore((state) => state.distributeElements)
  const bringForward = useProjectStore((state) => state.bringForward)
  const sendBackward = useProjectStore((state) => state.sendBackward)
  const { canUndo, canRedo, undo, redo } = useHistoryNavigation()
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const viewMode = useEditorStore((state) => state.viewMode)
  const setViewMode = useEditorStore((state) => state.setViewMode)
  const [exportOpen, setExportOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const hasSelection = selectedElementIds.length > 0
  const canDistribute = selectedElementIds.length >= 3

  const insertTools: ToolButtonProps[] = [
    { icon: Type, label: 'Text', onClick: addText },
    { icon: Square, label: 'Rectangle', onClick: () => addShape('rectangle') },
    { icon: Circle, label: 'Circle', onClick: () => addShape('circle') },
    { icon: Triangle, label: 'Triangle', onClick: () => addShape('triangle') },
    { icon: Minus, label: 'Line', onClick: () => addShape('line') },
  ]

  return (
    <>
      <header className="border-b border-border bg-panel">
        {/* Top bar */}
        <div className="flex items-center gap-2.5 px-3 py-2 sm:gap-3">
          <Link
            to="/"
            aria-label={`${APP_NAME} home`}
            className="group flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark size={32} className="transition-transform group-hover:scale-105 sm:hidden" />
            <BrandWordmark className="hidden sm:inline-flex" />
          </Link>

          {project?.name ? (
            <>
              <span className="hidden h-5 w-px shrink-0 bg-border sm:block" />
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <InlineEdit
                  value={project.name}
                  onChange={setProjectName}
                  className="min-w-0 flex-1 text-sm font-medium text-foreground"
                />
                <ProjectMenu />
              </div>
              <ScreenSwitcher />
              <SaveStatus />
            </>
          ) : (
            <span className="min-w-0 flex-1" />
          )}

          <div className="flex shrink-0 items-center gap-0.5">
            <IconButton
              icon={Undo2}
              label="Undo"
              disabled={!canUndo}
              onClick={undo}
            />
            <IconButton
              icon={Redo2}
              label="Redo"
              disabled={!canRedo}
              onClick={redo}
            />
            <IconButton icon={Settings} label="Settings" onClick={() => setSettingsOpen(true)} />
            <button
              type="button"
              data-tour="export-btn"
              onClick={() => setExportOpen(true)}
              title="Export"
              className="ml-1 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 sm:px-4"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Insert / tools row */}
        <div className="border-t border-border/60 px-2 sm:px-3">
          <div className="flex min-w-0 touch-pan-x items-center gap-1 overflow-x-auto py-1.5 pb-2 [scrollbar-width:none] sm:gap-1.5 [&::-webkit-scrollbar]:hidden">
            <ToolbarTooltipButton
              icon={LayoutGrid}
              label={viewMode === 'canvas' ? 'Overview mode' : 'Canvas mode'}
              onClick={() => setViewMode(viewMode === 'canvas' ? 'overview' : 'canvas')}
              className={viewMode === 'overview' ? 'bg-accent' : ''}
            />
            <ToolbarDivider />
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  aria-label="Insert element"
                  title="Insert"
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-secondary px-2.5 text-sm font-medium text-secondary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-2 sm:px-3"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Insert</span>
                  <ChevronDown size={14} className="opacity-60" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="start"
                  sideOffset={6}
                  className="z-50 w-44 rounded-lg border border-border bg-card p-1 shadow-lg"
                >
                  {insertTools.map((tool) => (
                    <InsertMenuItem key={tool.label} {...tool} />
                  ))}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <ToolbarDivider />

            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  aria-label="Add device frame"
                  title="Device"
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-card px-2 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5"
                >
                  <Smartphone size={16} className="shrink-0" />
                  <span className="hidden md:inline">Device</span>
                  <ChevronDown size={14} className="shrink-0 opacity-60" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="start"
                  sideOffset={6}
                  className="z-50 max-h-72 w-52 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg"
                >
                  {DEVICES.map((device) => (
                    <Popover.Close asChild key={device.id}>
                      <button
                        type="button"
                        onClick={() => addDevice(device.id)}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                      >
                        <Smartphone size={14} className="shrink-0 opacity-70" />
                        <span className="truncate">{device.name}</span>
                      </button>
                    </Popover.Close>
                  ))}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <ToolbarDivider />

            <div className="flex shrink-0 items-center gap-0.5">
              <ToolbarTooltipButton
                icon={AlignLeft}
                label="Align left"
                disabled={!hasSelection}
                onClick={() => alignElements(selectedElementIds, 'left')}
              />
              <ToolbarTooltipButton
                icon={AlignCenter}
                label="Align center"
                disabled={!hasSelection}
                onClick={() => alignElements(selectedElementIds, 'center')}
              />
              <ToolbarTooltipButton
                icon={AlignRight}
                label="Align right"
                disabled={!hasSelection}
                onClick={() => alignElements(selectedElementIds, 'right')}
              />
              <ToolbarTooltipButton
                icon={AlignStartHorizontal}
                label="Align top"
                disabled={!hasSelection}
                onClick={() => alignElements(selectedElementIds, 'top')}
              />
              <ToolbarTooltipButton
                icon={AlignCenterHorizontal}
                label="Align middle"
                disabled={!hasSelection}
                onClick={() => alignElements(selectedElementIds, 'middle')}
              />
              <ToolbarTooltipButton
                icon={AlignEndHorizontal}
                label="Align bottom"
                disabled={!hasSelection}
                onClick={() => alignElements(selectedElementIds, 'bottom')}
              />
            </div>

            <ToolbarDivider />

            <div className="flex shrink-0 items-center gap-0.5">
              <ToolbarTooltipButton
                icon={AlignHorizontalDistributeCenter}
                label="Distribute horizontal"
                ariaLabel="Distribute elements horizontally"
                disabled={!canDistribute}
                onClick={() => distributeElements(selectedElementIds, 'horizontal')}
              />
              <ToolbarTooltipButton
                icon={AlignVerticalDistributeCenter}
                label="Distribute vertical"
                ariaLabel="Distribute elements vertically"
                disabled={!canDistribute}
                onClick={() => distributeElements(selectedElementIds, 'vertical')}
              />
            </div>

            <ToolbarDivider />

            <div className="flex shrink-0 items-center gap-0.5">
              <ToolbarTooltipButton
                icon={AlignHorizontalJustifyCenter}
                label="Center on canvas (horizontal)"
                ariaLabel="Center selection horizontally on canvas"
                disabled={!hasSelection}
                onClick={() => alignToArtboard(selectedElementIds, 'horizontal')}
              />
              <ToolbarTooltipButton
                icon={AlignVerticalJustifyCenter}
                label="Center on canvas (vertical)"
                ariaLabel="Center selection vertically on canvas"
                disabled={!hasSelection}
                onClick={() => alignToArtboard(selectedElementIds, 'vertical')}
              />
            </div>

            <ToolbarDivider />

            <div className="flex shrink-0 items-center gap-0.5">
              <ToolbarTooltipButton
                icon={BringToFront}
                label="Bring forward"
                disabled={!hasSelection}
                onClick={() => selectedElementIds.forEach((id) => bringForward(id))}
              />
              <ToolbarTooltipButton
                icon={SendToBack}
                label="Send backward"
                disabled={!hasSelection}
                onClick={() => selectedElementIds.forEach((id) => sendBackward(id))}
              />
            </div>
          </div>
        </div>
      </header>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onShowShortcuts={() => {
          setSettingsOpen(false)
          setShortcutsOpen(true)
        }}
      />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  )
}
