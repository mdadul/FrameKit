type ThumbnailTask = () => Promise<void>

const queue: ThumbnailTask[] = []
let running = false

async function drainQueue(): Promise<void> {
  if (running) return
  running = true
  while (queue.length > 0) {
    const task = queue.shift()
    if (!task) continue
    try {
      await task()
    } catch {
      // Thumbnail failures are non-fatal
    }
    await new Promise<void>((resolve) => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => resolve(), { timeout: 120 })
      } else {
        setTimeout(resolve, 32)
      }
    })
  }
  running = false
}

export function enqueueThumbnailTask(task: ThumbnailTask): void {
  queue.push(task)
  void drainQueue()
}
