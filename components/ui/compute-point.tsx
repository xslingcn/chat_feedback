'use client'
import React, { useEffect } from 'react'
import { IconComputePoint } from './icons'
import useStore from '@/lib/hooks/use-compute-point-store'

export interface UserPointProps {
  userId: string
}

export function ComputePoint({ userId }: UserPointProps) {
  const userPoint = useStore(state => state.compute_point)
  const init = useStore(state => state.init)

  useEffect(() => {
    if (userId) {
      init(userId)
    }
  }, [userId, init])

  return (
    <div className="flex items-center ml-4">
      <IconComputePoint className="size-6 mr-2" />
      <span className="text-muted-foreground text-sm font-semibold ml-1">
        {userPoint}
      </span>
    </div>
  )
}
