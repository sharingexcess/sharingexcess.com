import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC, useState } from 'react'
import Draggable, { DraggableData } from 'react-draggable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAppleAlt,
  faBacon,
  faBreadSlice,
  faCarrot,
  faFish,
  faDrumstickBite,
  faHamburger,
  faHotdog,
} from '@fortawesome/free-solid-svg-icons'

const foodIcons = [
  faAppleAlt,
  faBacon,
  faBreadSlice,
  faCarrot,
  faFish,
  faDrumstickBite,
  faHamburger,
  faHotdog,
]

const x = [
  16, 55, 97, 52, 90, 1, 89, 25, 58, 7, 71, 2, 37, 65, 21, 85, 19, 99, 67, 96,
  94, 72, 4, 12, 20, 27, 100, 92, 33, 79, 9, 51, 40, 13, 88, 10, 76, 14, 60, 18,
  38, 68, 73, 53, 32, 30, 29, 62, 77, 22, 17, 91, 34, 24, 39, 78, 26, 84, 43,
  57, 50, 56, 47, 64, 49, 28, 6, 35, 61, 5, 8, 63, 93, 45, 80, 11, 83, 70, 36,
  75, 82, 59, 66, 54, 46, 15, 95, 42, 48, 74, 69, 98, 3, 81, 44, 87, 86, 23, 31,
  41,
]
const y = [
  14, 66, 46, 91, 51, 96, 1, 77, 18, 57, 93, 89, 8, 2, 81, 72, 95, 74, 30, 75,
  97, 85, 43, 20, 56, 65, 63, 54, 78, 26, 86, 79, 40, 69, 58, 4, 94, 13, 19, 41,
  50, 31, 76, 71, 32, 87, 52, 38, 60, 7, 36, 6, 28, 34, 9, 42, 48, 24, 5, 92,
  16, 53, 3, 21, 27, 84, 29, 47, 23, 25, 37, 39, 33, 61, 83, 49, 17, 45, 55,
  100, 64, 90, 70, 59, 10, 11, 44, 15, 22, 12, 35, 67, 99, 62, 82, 80, 73, 88,
  98, 68,
]

export const Donate: FC = () => {
  const isMobile = useIsMobile()
  const [dollars, setDollars] = useState(10)

  function handleDrag(_e: Event, data: DraggableData): void {
    const parent = document.getElementById('Donate-slider')
    if (parent) {
      const parentWidth = parent.offsetWidth - 64 // subtract width of handle
      const handlePosition = data.x
      const percentage = handlePosition / parentWidth
      const newDollars = Math.max(Math.round(100 * percentage), 1)
      setDollars(newDollars)
    }
  }

  return (
    <div id="Donate">
      <Text type="small-header" color="white" shadow>
        SUPPORT OUR MISSION
      </Text>
      <Spacer height={isMobile ? 12 : 32} />
      <Text type="primary-header" color="white" shadow>
        For every $1 donated, we can rescue and distribute 8 meals.
      </Text>
      <Spacer height={isMobile ? 8 : 16} />
      <Text type="subheader" color="white">
        There are lots of ways you can help Sharing Excess in your free time.
        Join more than 100 volunteers doing their part to make life more
        sustainable and equitable for everyone.
      </Text>
      <Spacer height={isMobile ? 0 : 64} />
      <section id="Donate-widget">
        <Text
          id="Donate-meals-text"
          type="primary-header"
          color="black"
          align="center"
        >
          {dollars * 8} Meals
        </Text>
        <Spacer height={isMobile ? 32 : 64} />
        <div id="Donate-slider">
          <div id="Donate-slider-track" />
          <Draggable axis="x" onDrag={handleDrag} bounds="parent">
            <div id="Donate-slider-handle">
              <Text type="small-header" color="white" align="center">
                ${dollars}
              </Text>
            </div>
          </Draggable>
          <Spacer height={8} />
          <div id="Donate-slider-labels">
            <Text type="small" color="white">
              $0
            </Text>
            <Text type="small" color="white">
              $25
            </Text>
            <Text type="small" color="white">
              $50
            </Text>
            <Text type="small" color="white">
              $75
            </Text>
            <Text type="small" color="white">
              $100
            </Text>
          </div>
        </div>
        {Array.from(Array(100).keys()).map(i => (
          <FontAwesomeIcon
            key={i}
            className="Donate-widget-icon"
            style={{
              top: `${x[i]}%`,
              left: `${y[i]}%`,
              opacity: i < dollars ? 0.2 : 0,
            }}
            icon={foodIcons[i % 8]}
          />
        ))}
      </section>
      <Spacer height={16} />
      <Button id="Donate-button" type="primary" size="large" color="white">
        Donate <span className="green">${dollars}</span> to Rescue{' '}
        <span className="green">{dollars * 8}</span> Meals
      </Button>
    </div>
  )
}
