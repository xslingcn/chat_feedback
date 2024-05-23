import { CoreMessage } from 'ai'

export type Message = CoreMessage & {
  id: string
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
}

export interface Feedback {
  instruction: boolean | '';
  helpful: boolean | '';
  factual: boolean | '';
  style: boolean | '';
  sensitive: boolean | '';
  toxic: boolean | '';
}
export type FeedbackKey = 'instruction' | 'helpful' | 'factual' | 'style' | 'sensitive' | 'toxic';


export interface Quality extends Feedback {
  item_id: string;
}

export interface CardData {
  totalChats: number
  qualities: number
  suggestions: number
  feedbackByYou: number | null
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
    error: string
  }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}
