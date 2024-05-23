import * as React from 'react'

import { redirect } from 'next/navigation'
import { Button } from './ui/button'
import { IconArrowRight } from './ui/icons'
import { redirectToLogin } from '@/app/login/actions'

export default function PromptLoginPanel() {
  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="space-y-4 bg-background px-4 py-2 shadow-lg sm:rounded-t-xl md:py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Start a chat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Login to start chatting and giving feedbacks!
              </p>
            </div>
            <form action={redirectToLogin}>
              <Button className="rounded-full" size="icon" variant="outline">
                <IconArrowRight></IconArrowRight>
                <span className="sr-only">Login to start a chat</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
