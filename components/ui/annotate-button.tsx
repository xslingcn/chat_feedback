'use client'
import { getRandomChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { IconFeedback } from './icons'

export default function AnnotateButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      size="icon"
      className="size-8 bg-background p-2 text-xs"
      onClick={async () => {
        const result = await getRandomChat()
        console.log(result)
        if (result?.success) {
          try {
            router.push('/chat/' + result.success)
          } catch (error) {
            console.log(error)
          }
        } else if (result?.failure) {
          toast.error(result.failure)
        } else if (result?.error) {
          console.error(result.error)
        }
      }}
    >
      <IconFeedback></IconFeedback>
    </Button>
  )
}
