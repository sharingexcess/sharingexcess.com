import {
  Button,
  Image,
  Spacer,
  Text,
  ExternalLink,
  Card,
} from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'

const content = [
  {
    image: '/phillymag.png',
    header:
      'This Student-Run Food Rescue Program Delivers 100,000 Pounds of Food to Philadelphians Per Week',
    publisher: 'Philly Mag',
    date: 'February 23, 2021',
    url: 'https://www.phillymag.com/be-well-philly/2021/02/23/sharingexcess/',
    body: 'Last March, as Philly scrambled to adjust our lives to Governor Tom Wolf’s new shutdown orders, Drexel alum and Sharing Excess founder Evan Ehlers realized something: Restaurants prepared for a busy week would suddenly find themselves awash in leftover food. Sharing Excess, the fledgling food rescue nonprofit founded by Ehlers and staffed by college students, sprung into action. In 48 hours, Ehlers and his team rescued more than 10,000 pounds of food — enough to feed roughly 90 families of four for a week — from 24 different restaurants, including Saxby’s cafes and Stephen Starr locations. ',
  },
  {
    image: '/bloomberg.png',
    header: 'Food Sharing During Covid-19',
    publisher: 'Bloomberg',
    date: 'May 17, 2020',
    url: 'https://www.bloomberg.com/news/videos/2020-05-17/food-sharing-during-covid-19-video',
    body: 'Meet the 24-year-old founder of Sharing Excess that is getting good food to the people that need it most during the coronavirus pandemic. (Source: QuickTake)',
  },
  {
    image: '/inquirer.png',
    header:
      'As Philly restaurants shutter, massive amounts of food are at risk of going to waste. Here’s how to help.',
    publisher: 'Philly Inquirer',
    date: 'March 16, 2020',
    url: 'https://www.inquirer.com/health/coronavirus/coronavirus-shutdown-philadelphia-food-waste-restaurants-closing-philabundance-20200316.html',
    body: 'On Monday, Philadelphia restaurants responded to Mayor Jim Kenney’s order that they restrict operations to pickup and/or delivery. While some partnered with third-party carriers or prepared to offer curbside delivery, other establishments decided to temporarily close — which creates the potential for a massive amount of food going to waste.',
  },
  {
    image: '/nbc10.png',
    header: 'Nonprofits Join Together to Share LOVE',
    publisher: 'NBC 10',
    date: 'May 28, 2020',
    url: 'https://www.nbcphiladelphia.com/entertainment/philly-live/non-profits-join-together-to-share-love/2410662/',
    body: 'A group of Philly nonprofits has joined together to give back to the community during the coronavirus pandemic. ‘Sharing LOVE’ is providing meals to anyone in need. Philly Live’s Aunyea Lachelle talks to Evan Ehlers about how you can help.',
  },
]

export const News: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="News">
      <Text type="small-header" color="green" shadow>
        IN THE NEWS
      </Text>
      <Spacer height={isMobile ? 8 : 32} />
      <Text type="primary-header" color="white" shadow>
        We’ve grown from a crazy idea, to a national movement.
      </Text>
      <Spacer height={isMobile ? 8 : 16} />
      <Text type="subheader" color="grey" shadow>
        With chapters at 12 campuses, Sharing Excess is continually growing to
        become the leader in food redistribution around the country.
      </Text>
      <Spacer height={isMobile ? 32 : 64} />
      <section id="News-content">
        {content.map(c => (
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
      </section>
      <Spacer height={isMobile ? 16 : 64} />
      <Button type="primary" size="large" color="white">
        Read More News Stories
      </Button>
    </div>
  )
}
