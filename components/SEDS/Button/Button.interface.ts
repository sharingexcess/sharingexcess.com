import { HTMLProps, ReactNode } from 'react'

export default interface Button
  extends Omit<HTMLProps<HTMLButtonElement>, 'size' | 'onClick'> {
  id?: string
  type?: 'primary' | 'secondary' | 'tertiary'
  size?: 'small' | 'medium' | 'large'
  color?: 'white' | 'green' | 'black'
  classList?: string[]
  children: ReactNode
  handler?: () => any
}
