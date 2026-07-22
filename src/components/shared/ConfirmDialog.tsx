import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export interface ConfirmDialogProps {
  trigger: ReactNode
  title: ReactNode
  description: ReactNode
  onConfirm?: () => void | Promise<void>
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'destructive'
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'default',
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant={tone === 'destructive' ? 'destructive' : 'default'} onClick={() => void onConfirm?.()}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
