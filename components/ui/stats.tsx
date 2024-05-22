import { CardTitle, CardHeader, CardContent, Card } from '@/components/ui/card'

export default function Stats({ data }) {
  return (
    <main className="flex flex-col gap-6 p-6 md:p-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Chats</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <span className="text-4xl font-bold">{data.totalChats}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Qualitative Feedback</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <span className="text-4xl font-bold">{data.qualities}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Constructed Responses</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <span className="text-4xl font-bold">{data.suggestions}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Feedback by you</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <span className="text-4xl font-bold">{data.feedbackByYou}</span>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
