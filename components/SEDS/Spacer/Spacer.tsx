import React, { FC } from 'react'
import SpacerProps from './Spacer.interface'

/**
 * component: Spacer
 *
 * Summary:
 * Used to create empty space between elements in a container
 *
 * Description:
 * Allows other UI components to be more reusable an extensible
 * by replacing the need to add margin to the top, bottom, left, or right
 * of an existing element, requiring style override of the UI kit default
 *
 * @param height: int
 * Used to define the height of the empty, invisible div
 * Note: should be used in increments of 8px whenever possible
 *
 * @param width: int
 * Used to define the width of the empty, invisible div
 * Note: should be used in increments of 8px whenever possible
 *
 * @return empty, invisible HTML <div/> element to create empty space
 */
export const Spacer: FC<SpacerProps> = ({ height = 8, width = 8 }) => {
  return <div className="se-spacer" style={{ height, width }} />
}
