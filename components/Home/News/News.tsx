import {
  Button,
  Image,
  Spacer,
  Text,
  ExternalLink,
  Card,
} from '@sharingexcess/designsystem'
import { articles } from 'content'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'
import Link from 'next/link'

export const News: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="News">
      <Text type="small-header" color="green" shadow>
        IN THE NEWS
      </Text>
      <Spacer height={isMobile ? 8 : 32} />
      <Text type="primary-header" color="white" shadow>
        We’ve grown from a student startup, to a national movement.
      </Text>
      <Spacer height={isMobile ? 8 : 16} />
      <Text type="subheader" color="grey" shadow>
        With chapters at 12 campuses, Sharing Excess is continually growing to
        become the leader in food redistribution around the country.
      </Text>
      <Spacer height={isMobile ? 32 : 64} />
      <section id="News-content">
        <Spacer className="News-content-spacer" />
        {articles.map(c => (
          <Card classList={['News-article']} key={c.header}>
            <Image src={c.image} alt={c.header} />
            <Spacer height={16} />
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
                  color="green"
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
              <Button type="primary" size="small" fullWidth>
                Read More
              </Button>
            </ExternalLink>
          </Card>
        ))}
        <Spacer className="News-content-spacer" />
      </section>
      <Spacer height={isMobile ? 16 : 64} />
      <Button type="primary" size="large" color="white">
        <Link href="/news">Read More News Stories</Link>
      </Button>
    </div>
  )
}
