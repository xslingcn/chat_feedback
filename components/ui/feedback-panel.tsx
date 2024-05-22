// @ts-nocheck
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroupItem, RadioGroup } from '@/components/ui/radio-group'
import { Feedback } from '@/lib/types'

export default function FeedbackPanel({
  onSubmit
}: {
  onSubmit: (feedback: Feedback) => void
}) {
  const [feedback, setFeedback] = useState<Feedback>({
    instruction: null,
    helpful: null,
    factual: null,
    style: null,
    sensitive: null,
    toxic: null
  })
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true)

  const handleFeedbackChange = (question: keyof Feedback, value: string) => {
    setFeedback(prevFeedback => ({
      ...prevFeedback,
      [question]: value
    }))
  }

  const handleSubmit = () => {
    onSubmit(feedback)
  }

  useEffect(() => {
    const allSelected = Object.values(feedback).every(value => value !== null)
    setIsSubmitDisabled(!allSelected)
  }, [feedback])

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>
          Earn compute points by providing feedback!
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {[
          {
            id: 'instruction',
            label: 'Instruction',
            description: 'Does this response follow the instructions provided?'
          },
          {
            id: 'helpful',
            label: 'Helpful',
            description: 'Is this response helpful?'
          },
          {
            id: 'factual',
            label: 'Factual',
            description: 'Is this response factual?'
          },
          {
            id: 'style',
            label: 'Style',
            description: 'Do you like the style of this response?'
          },
          {
            id: 'sensitive',
            label: 'Sensitive',
            description: 'Does this response contain any sensitive information?'
          },
          {
            id: 'toxic',
            label: 'Toxic',
            description: 'Does this response include any harmful content?'
          }
        ].map(({ id, label, description }) => (
          <div key={id} className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={id}>{label}</Label>
              <RadioGroup
                className="flex items-center gap-2"
                value={feedback[id] === null ? '' : feedback[id].toString()}
                id={id}
                onValueChange={value => handleFeedbackChange(id, value)}
              >
                <Label
                  className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-primary [&:has(:checked)]:text-primary-foreground"
                  htmlFor={`${id}-false`}
                >
                  <RadioGroupItem id={`${id}-false`} value="false" />
                  No
                </Label>
                <Label
                  className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-primary [&:has(:checked)]:text-primary-foreground"
                  htmlFor={`${id}-true`}
                >
                  <RadioGroupItem id={`${id}-true`} value="true" />
                  Yes
                </Label>
              </RadioGroup>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}
