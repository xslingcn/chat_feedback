import { useEffect, useState } from 'react'
import { IconComputePoint } from '@/components/ui/icons'
import Stats from './ui/stats'
import { getCardData } from '@/app/actions'

export function EmptyScreen() {
  const [cardData, setCardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCardData()
        if (data.error) {
          setError(data.error)
        } else {
          setCardData(data)
        }
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8 mx-auto max-w-2xl">
        <h1 className="text-lg font-semibold">Welcome to ChatFeedback demo!</h1>
        <p className="leading-normal text-muted-foreground">
          This is a concept demo currently under heavy development! The
          <span className="inline-flex items-center mx-1 align-middle	">
            <IconComputePoint className="size-6" />
          </span>
          on the top left is the <i>Compute Point</i>. For now, you can earn
          points by providing quality feedback and spend them to generate new
          responses.
        </p>
        <p className="leading-normal text-muted-foreground">
          Many proposed features are still WIP:
          <ul className="list-none">
            <li className="flex items-start mb-2">
              <input type="checkbox" className="mr-2 mt-1" disabled />
              <span>
                Pooling Chatlogs: Merging chatlogs and random distribute them
                for annotation
              </span>
            </li>
            <li className="flex items-start mb-2">
              <input type="checkbox" className="mr-2 mt-1" disabled />
              <span>
                Constructed Responses: Allowing users to suggest a manually
                created response.
              </span>
            </li>
            <li className="flex items-start mb-2">
              <input type="checkbox" className="mr-2 mt-1" disabled />
              <span>
                Fused Chat and Direct Chat: Randomly assign LLMs to chat,
                allowing comparison and more resource saving.
              </span>
            </li>
            <li className="flex items-start mb-2">
              <input type="checkbox" className="mr-2 mt-1" disabled />
              <span>
                Confidence Score: Confidence score system to prevent spamming.
              </span>
            </li>
          </ul>
        </p>
      </div>
      <div className="mx-auto sm:max-w-2xl lg:max-w-6xl px-4">
        <Stats data={cardData} />
      </div>
    </div>
  )
}
