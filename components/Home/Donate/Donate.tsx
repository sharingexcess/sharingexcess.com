import { Button, ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'
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
  82, 95, 84, 5, 76, 61, 71, 14, 26, 25, 4, 81, 2, 39, 43, 63, 35, 93, 16, 37,
  12, 92, 3, 47, 64, 97, 18, 29, 75, 30, 19, 60, 11, 23, 58, 91, 74, 88, 67, 24,
  21, 6, 72, 50, 53, 56, 42, 15, 38, 89, 90, 55, 1, 99, 54, 10, 9, 28, 79, 87,
  68, 41, 78, 80, 83, 32, 86, 49, 70, 20, 77, 65, 66, 62, 40, 7, 33, 22, 13, 73,
  98, 100, 17, 27, 48, 59, 52, 31, 34, 51, 45, 8, 44, 94, 36, 85, 96, 69, 57,
  46,
]
const y = [
  49, 72, 34, 16, 44, 83, 33, 76, 58, 41, 52, 19, 40, 3, 69, 17, 48, 100, 43,
  68, 64, 24, 37, 10, 23, 12, 26, 20, 15, 70, 2, 45, 35, 21, 81, 80, 99, 28, 59,
  73, 78, 31, 71, 51, 65, 90, 93, 89, 32, 13, 5, 98, 11, 50, 79, 94, 84, 29, 54,
  14, 92, 85, 74, 27, 9, 4, 86, 75, 97, 53, 1, 57, 82, 87, 25, 47, 38, 8, 18,
  66, 67, 6, 39, 91, 96, 62, 30, 7, 88, 60, 61, 46, 42, 63, 36, 95, 56, 77, 55,
  22,
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
      <ExternalLink
        fullWidth
        to="https://app.mobilecause.com/form/l2Z4OQ?vid=lpnht"
      >
        <Button id="Donate-button" type="primary" size="large" color="white">
          Donate <span className="green">${dollars}</span> to Rescue{' '}
          <span className="green">{dollars * 8}</span> Meals
        </Button>
      </ExternalLink>
    </div>
  )
}
