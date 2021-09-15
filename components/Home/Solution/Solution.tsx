import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import React, { FC } from 'react'

export const Solution: FC = () => {
  return (
    <div id="Solution">
      <section id="Solution-carousel">
        <Image src="/splash5.jpg" alt="Test" />
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
        <Button type="primary" size="large" color="green">
          Learn More About Our Programs
        </Button>
      </section>
    </div>
  )
}
