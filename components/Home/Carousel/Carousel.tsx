import { Image } from 'components/SEDS'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'

export const Carousel: FC = () => {
  const isMobile = useIsMobile()

  return isMobile ? null : (
    <div id="Carousel">
      <Image
        src="/splash1.png"
        classList={['focus']}
        alt="Sharing Excess Splash Image"
      />
      <Image src="/splash2.png" alt="Sharing Excess Splash Image" />
      <Image src="/splash3.png" alt="Sharing Excess Splash Image" />
      <Image src="/splash4.png" alt="Sharing Excess Splash Image" />
    </div>
  )
}
