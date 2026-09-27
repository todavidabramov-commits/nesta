'use client'

import { Toaster } from 'sonner'

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      gap={10}
      offset={24}
      duration={2800}
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast:
            'rounded-lg border border-line bg-surface text-ink shadow-[0_12px_32px_rgba(22,51,36,0.12)] font-[family-name:var(--font-ui)]',
          title: 'text-[13px] font-semibold text-ink',
          description: 'text-xs text-muted',
          success: '!border-forest/20',
          error: '!border-accent/40',
          actionButton: '!bg-forest !text-surface !text-xs !font-bold',
          cancelButton: '!bg-transparent !text-muted !text-xs',
        },
      }}
    />
  )
}
