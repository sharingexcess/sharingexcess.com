import React, { FC } from 'react'
import { Image, Text, Spacer, FlexContainer } from '@sharingexcess/designsystem'

interface PageHeaderProps {
  image: string
  video?: string
  label?: string
  title: string
}

export const PageHeader: FC<PageHeaderProps> = ({
  image,
  video,
  label,
  title,
}) => {
  return (
    <FlexContainer
      id="PageHeader"
      direction="vertical"
      primaryAlign="end"
      secondaryAlign="start"
    >
      {video ? (
        <video
          id="PageHeader-video"
          src={video}
          autoPlay
          playsInline
          preload="auto"
          muted
          loop
          poster={image}
        />
      ) : (
        <Image id="PageHeader-image" src={image} alt="Page Header Image" />
      )}
      <FlexContainer
        id="PageHeader-content"
        direction="vertical"
        primaryAlign="end"
        secondaryAlign="start"
      >
        {label && (
          <>
            <Text
              id="PageHeader-label"
              type="small-header"
              color="green"
              shadow
            >
              {label}
            </Text>
            <Spacer height={8} />
          </>
        )}
        <Text id="PageHeader-title" type="primary-header" color="white" shadow>
          {title}
        </Text>
      </FlexContainer>
    </FlexContainer>
  )
}
