import {
  Button,
  Image,
  Spacer,
  Text,
  ExternalLink,
  Card,
  FlexContainer,
} from '@sharingexcess/designsystem'
import { PageHeader } from 'components'
import { articles } from 'content'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'
import { DONATE_LINK } from 'utils/constants'
import Link from 'next/link'
import Head from 'next/head'

export const News: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div className="News">
      <Head>
        <title>In the News | Sharing Excess</title>
      </Head>
      <PageHeader
        label="IN THE NEWS"
        title="We've grown from a student startup, to a national movement."
        image="/headers/news.jpg"
      />
      <Spacer height={48} />
      <section id="News-content">
        {articles.map(c => (
          <Card classList={['News-article']} key={c.header}>
            <Image
              classList={['News-article-image']}
              src={c.image}
              alt={c.header}
            />
            <FlexContainer
              className="News-article-content"
              direction="vertical"
              primaryAlign="center"
              secondaryAlign="start"
            >
              <Text
                classList={['News-article-header']}
                type="paragraph"
                color="black"
              >
                {c.header}
              </Text>
              <div className="News-article-publication">
                <ExternalLink to={c.url}>
                  <Button
                    classList={['News-article-publisher']}
                    type="tertiary"
                    color="blue"
                  >
                    {c.publisher}
                  </Button>
                </ExternalLink>
                <Spacer width={8} />
                <Text
                  classList={['News-article-date']}
                  type="paragraph"
                  color="black"
                >
                  {c.date}
                </Text>
              </div>
              <Spacer height={8} />
              <Text classList={['News-article-body']} type="small" color="grey">
                {c.body}
              </Text>
              <Spacer height={24} />
              <ExternalLink to={c.url}>
                <Button type="primary" fullWidth={isMobile}>
                  {c.button || 'Read More'}
                </Button>
              </ExternalLink>
            </FlexContainer>
          </Card>
        ))}
      </section>

      <Spacer height={48} />
      <FlexContainer direction="vertical">
        <Text type="small-header" color="green" shadow align="center">
          LIKE WHAT YOU SEE?
        </Text>
        <Spacer height={8} />
        <Text type="secondary-header" color="white" shadow align="center">
          Support Sharing Excess today.
        </Text>
        <Spacer height={8} />
        <Text type="subheader" color="grey" shadow align="center">
          Your support powers our work and allows us to continue expanding to
          new cities across the country.
        </Text>
        <Spacer height={48} />
        <FlexContainer direction={isMobile ? 'vertical' : 'horizontal'}>
          <ExternalLink to={DONATE_LINK}>
            <Button type="primary" color="green" size="large">
              Make a Donation
            </Button>
          </ExternalLink>
          <Spacer width={16} height={16} />
          <Button type="primary" color="white" size="large">
            <Link href="/about">Get Involved</Link>
          </Button>
        </FlexContainer>
      </FlexContainer>
    </div>
  )
}
