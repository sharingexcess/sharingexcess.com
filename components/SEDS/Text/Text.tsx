import React, { FC } from 'react'
import TextProps from './Text.interface'

/**
 * component: Text
 *
 * Summary:
 * Used for any text rendered in the application to maintain consistency of styling
 * and reduce the need to write and rewrite custom CSS
 *
 * Description:
 * Allows other UI components to be more reusable an extensible
 * by replacing the need to add margin to the top, bottom, left, or right
 * of an existing element, requiring style override of the UI kit default
 *
 * @param type: solid, outline, text
 * Defines the appearance of the text
 * `primary-header` is the largest, most prominent text such as page titles
 * `secondary-header` is used for any prominent text and headers below a page title
 * `small-header` is used for sections, or item headers
 * `subheader` is used as a description under a larger header
 * `paragraph` is used for all basic text and body elements
 *
 * @param color: black, white, green
 * Changes the color of the text itself.
 *
 * @param shadow: boolean
 * Will apply the proper text shadow if true.
 *
 * @param id: string
 * Used to apply a custom ID property to the HTML button element
 *
 * @param classList: string[]
 * Used to apply a list of custom classes to the HTML button element
 *
 * @param align: left, center, right
 * Used to define the element's text alignment
 *
 * @param wrap: boolean
 * Used to define whether the text should wrap onto multiple lines,
 * or cut off with an ellipsis
 *
 * @return HTML <div/> element containing provided text
 */
export const Text: FC<TextProps> = ({
  children,
  type = 'paragraph',
  color = 'black',
  shadow = false,
  id,
  classList,
  align = 'left',
  wrap = true,
}) => {
  let className = `se-text ${type} ${align} ${color} ${
    wrap ? 'wrap' : 'no-wrap'
  } ${shadow ? 'shadow' : 'no-shadow'}`
  if (classList) {
    className = `${className} ${classList.join(' ')}`
  }

  return (
    <div className={className} id={id}>
      {children}
    </div>
  )
}
