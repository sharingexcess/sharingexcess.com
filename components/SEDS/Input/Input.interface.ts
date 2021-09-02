import { ChangeEventHandler, HTMLProps } from 'react'

export default interface InputProps
  extends Omit<HTMLProps<HTMLInputElement>, 'onChange'> {
  id?: string
  classList?: string[]
  type?: 'text' | 'number' | 'tel'
  label: string
  value: string
  error?: boolean
  validated?: boolean
  style?: Record<string, string | number>
  numRows?: number | undefined
  onChange: ChangeEventHandler<HTMLInputElement> | undefined
}
