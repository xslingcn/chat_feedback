'use client'

import {
  IconAssistant,
  IconFeedback,
  IconFeedbackSelected,
  IconUser
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { CodeBlock } from './codeblock'
import { MemoizedReactMarkdown } from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import { spinner } from './spinner'
import { useState } from 'react'
import FeedbackPanel from './feedback-panel'
import { saveQuality } from '@/app/actions'
import { Feedback, Quality } from '@/lib/types'
import { toast } from 'sonner'
import useStore from '@/lib/hooks/use-compute-point-store'

// Different types of message bubbles.

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        <IconUser />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
        {children}
      </div>
    </div>
  )
}

export function BotMessage({
  content,
  item_id,
  className
}: {
  content: string | StreamableValue<string>
  item_id: string
  className?: string
}) {
  const text = useStreamableText(content)
  const [feedbackSelected, setSelected] = useState(false)
  const compute_point = useStore(state => state.compute_point)
  const user_id = useStore(state => state.user_id)
  const saveUserPoint = useStore(state => state.saveUserPoint)

  const onFeedback = async (feedback: Feedback) => {
    const quality: Quality = {
      ...feedback,
      item_id: item_id
    }
    const result = await saveQuality(quality)
    if (!result?.error) {
      setSelected(false)
      toast.success('Feedback submitted')
      saveUserPoint(user_id, compute_point + 1)
    }
  }

  return (
    <div>
      <div
        className={cn('group relative flex items-start md:-ml-12', className)}
      >
        <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
          <IconAssistant />
        </div>
        <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
          <MemoizedReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>
              },
              code({ node, inline, className, children, ...props }) {
                if (children.length) {
                  if (children[0] == '▍') {
                    return (
                      <span className="mt-1 animate-pulse cursor-default">
                        ▍
                      </span>
                    )
                  }

                  children[0] = (children[0] as string).replace('`▍`', '▍')
                }

                const match = /language-(\w+)/.exec(className || '')

                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }

                return (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ''}
                    value={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                )
              }
            }}
          >
            {text}
          </MemoizedReactMarkdown>
        </div>
        <div className="flex space-x-2 ml-auto">
          <button
            className="icon-button absolute bottom-0 right-0"
            onClick={() => setSelected(!feedbackSelected)}
          >
            {feedbackSelected ? <IconFeedbackSelected /> : <IconFeedback />}
          </button>
        </div>
      </div>
      <div
        className={`mt-4 w-full transition-transform duration-400 ${feedbackSelected ? 'transform scale-100' : 'transform scale-95 opacity-0 pointer-events-none'}`}
      >
        {feedbackSelected && <FeedbackPanel onSubmit={onFeedback} />}
      </div>
    </div>
  )
}

export function BotCard({
  children,
  showAvatar = true
}: {
  children: React.ReactNode
  showAvatar?: boolean
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          'flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm',
          !showAvatar && 'invisible'
        )}
      >
        <IconAssistant />
      </div>
      <div className="ml-4 flex-1 pl-2">{children}</div>
    </div>
  )
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        'mt-2 flex items-center justify-center gap-2 text-xs text-gray-500'
      }
    >
      <div className={'max-w-[600px] flex-initial p-2'}>{children}</div>
    </div>
  )
}

export function SpinnerMessage() {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconAssistant />
      </div>
      <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        {spinner}
      </div>
    </div>
  )
}
