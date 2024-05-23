import { getPublicCardData, getFeedbackByYou } from '@/app/actions'
import { CardTitle, CardHeader, CardContent, Card } from '@/components/ui/card'
import { CardData, Session } from '@/lib/types'
import { useState, useEffect } from 'react'

export interface StatsProps {
  session?: Session
}

export default function Stats({ session }: StatsProps) {
  const [cardData, setCardData] = useState<CardData>({
    totalChats: 0,
    qualities: 0,
    suggestions: 0,
    feedbackByYou: null
  })

  useEffect(() => {
    async function fetchPublicData() {
      const data: CardData | { error: string } = await getPublicCardData()

      if (!data) {
        console.error('Failed to fetch card data')
        return
      }
      if ('error' in data) {
        console.error(data.error)
        return
      }

      setCardData(data)
    }

    fetchPublicData()
  }, [])

  useEffect(() => {
    async function fetchFeedbackByYou(userId: string) {
      const data = await getFeedbackByYou(userId)

      if (!data) {
        console.error('Failed to fetch feedback by you')
        return
      }

      setCardData(prev => ({ ...prev, feedbackByYou: data }))
    }

    if (session?.user) {
      fetchFeedbackByYou(session.user.id)
    }
  }, [session])
  console.log(session)

  return (
    <main className="flex flex-col gap-6 p-6 md:p-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Chats', data: cardData.totalChats },
          { title: 'Qualitative Feedback', data: cardData.qualities },
          { title: 'Constructed Responses', data: cardData.suggestions },
          { title: 'Feedback by You', data: cardData.feedbackByYou }
        ].map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl font-bold">
                {card.data ? card.data : 'N/A'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
