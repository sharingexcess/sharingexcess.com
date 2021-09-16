import { Image } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import { Carousel as CarouselComponent } from 'react-responsive-carousel'
import React, { FC } from 'react'

export const Carousel: FC = () => {
  const isMobile = useIsMobile()

  const Images = () => (
    <>
      <Image
        src="/splash1.png"
        classList={['focus']}
        alt="Sharing Excess Splash Image"
      />
      <Image src="/splash2.png" alt="Sharing Excess Splash Image" />
      <Image src="/splash3.png" alt="Sharing Excess Splash Image" />
      <Image src="/splash4.png" alt="Sharing Excess Splash Image" />
    </>
  )

  return (
    <div id="Carousel">
      {isMobile ? (
        <CarouselComponent
          autoPlay
          infiniteLoop
          interval={2000}
          transitionTime={500}
          showArrows={false}
          showThumbs={false}
          showStatus={false}
          swipeable={false}
          stopOnHover={false}
          centerMode
          centerSlidePercentage={50}
          showIndicators={false}
        >
          <aside>
            <Image
              src="/splash1.png"
              classList={['focus']}
              alt="Sharing Excess Splash Image"
            />
          </aside>
          <aside>
            <Image src="/splash2.png" alt="Sharing Excess Splash Image" />
          </aside>
          <aside>
            <Image src="/splash3.png" alt="Sharing Excess Splash Image" />
          </aside>
          <aside>
            <Image src="/splash4.png" alt="Sharing Excess Splash Image" />
          </aside>
        </CarouselComponent>
      ) : (
        <Images />
      )}
    </div>
  )
}
