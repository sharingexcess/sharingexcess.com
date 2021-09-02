import { HTMLProps, ReactNode } from 'react'

export default interface Text extends Omit<HTMLProps<HTMLDivElement>, 'wrap'> {
  children: ReactNode
  type?:
    | 'primary-header'
    | 'secondary-header'
    | 'small-header'
    | 'subheader'
    | 'paragraph'
  color?: 'black' | 'white' | 'green'
  shadow?: boolean
  id?: string
  align?: 'left' | 'center' | 'right'
  wrap?: boolean
  classList?: string[]
}
