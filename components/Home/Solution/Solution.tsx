import React, { FC } from 'react'
import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

export const Solution: FC = () => {
  return (
    <div id="Solution">
      <section id="Solution-carousel">
        <Carousel
          autoPlay
          infiniteLoop
          interval={3000}
          transitionTime={600}
          showArrows={false}
          dynamicHeight={true}
          showThumbs={false}
          showStatus={false}
          swipeable={false}
          stopOnHover={false}
        >
          <Image src="/solution1.png" alt="Test" />
          <Image src="/solution2.png" alt="Test" />
          <Image src="/solution3.png" alt="Test" />
          <Image src="/solution4.png" alt="Test" />
        </Carousel>
      </section>
      <section id="Solution-content">
        <Text type="small-header" color="green" align="right">
          OUR SOLUTION
        </Text>
        <Spacer height={16} />
        <Text type="primary-header" color="black" align="right">
          Rescue, Transport, Deliver.
        </Text>
        <Spacer height={16} />
        <Text type="subheader" color="black" align="right">
          We identify vendors with surplus, dispatch drivers to rescue food, and
          distribute this perfectly edible and delicious food to community
          members free of charge. See how we do it:
        </Text>
        <Spacer height={32} />
        <Button type="primary" size="medium" color="green">
          Learn More About Our Programs
        </Button>
      </section>
    </div>
  )
}
