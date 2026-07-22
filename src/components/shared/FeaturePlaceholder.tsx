import type { ReactNode } from 'react'
import { EmptyState } from './async-states'
import { PageHeader } from './PageHeader'

export interface FeaturePlaceholderProps {
  title: ReactNode
  subtitle?: ReactNode
  description: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

export function FeaturePlaceholder({ title, subtitle, description, actions, children }: FeaturePlaceholderProps) {
  return (
    <div className='space-y-6'>
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
      <EmptyState
        title='Đang hoàn thiện'
        description={typeof description === 'string' ? description : undefined}
        action={typeof description === 'string' ? undefined : <div>{description}</div>}
      />
    </div>
  )
}
