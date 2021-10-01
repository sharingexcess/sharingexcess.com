import React, { FC } from 'react'
import { Button, Image, Spacer, Text, Card } from '@sharingexcess/designsystem'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { useIsMobile } from 'hooks'
import Link from 'next/link'

export const Solution: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="Solution">
      <section id="Solution-carousel">
        {isMobile ? (
          <Image src="/solution1.png" alt="Test" />
        ) : (
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
        )}
      </section>
      <Card id="Solution-content">
        <Text
          type="small-header"
          color={isMobile ? 'white' : 'green'}
          align="right"
        >
          OUR SOLUTION
        </Text>
        <Spacer height={isMobile ? 4 : 16} />
        <Text
          type="primary-header"
          color={isMobile ? 'white' : 'black'}
          align="right"
        >
          Rescue,
        </Text>
        <Text
          type="primary-header"
          color={isMobile ? 'white' : 'black'}
          align="right"
        >
          Transport,
        </Text>
        <Text
          type="primary-header"
          color={isMobile ? 'white' : 'black'}
          align="right"
        >
          Deliver.
        </Text>
        <Spacer height={16} />
        <Text
          type="subheader"
          color={isMobile ? 'white' : 'grey'}
          align="right"
        >
          We identify vendors with surplus, dispatch drivers to rescue food, and
          distribute this perfectly edible and delicious food to community
          members free of charge. See how we do it:
        </Text>
        <Spacer height={isMobile ? 16 : 32} />
        <Link href="/about" passHref>
          <Button
            type="primary"
            size="medium"
            color={isMobile ? 'white' : 'green'}
          >
            Learn About Our Programs
          </Button>
        </Link>
      </Card>
    </div>
  )
}
