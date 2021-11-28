import React, { FC, useEffect, useState } from 'react'
import Head from 'next/head'
import {
  Image,
  Spacer,
  Text,
  Button,
  FlexContainer,
} from '@sharingexcess/designsystem'
import { team } from 'content/team'
import { useIsMobile } from 'hooks'
import { PageHeader } from 'components'
import { volunteering } from 'content'
import { useRouter } from 'next/router'

export const About: FC = () => {
  const isMobile = useIsMobile()
  const [section, setSection] = useState('history')
  const router = useRouter()

  useEffect(() => {
    if (router?.query?.section && typeof router.query.section === 'string') {
      setSection(router.query.section)
    }
  }, [router.query])

  return (
    <div id="About">
      <Head>
        <title>About | Sharing Excess</title>
      </Head>
      <PageHeader
        image={isMobile ? '/headers/about_mobile.jpeg' : '/headers/about.jpeg'}
        label="ABOUT US"
        title={`Sharing Excess is using surplus\nto fight scarcity.`}
      />

      <Spacer height={isMobile ? 48 : 64} />

      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image src="/about/popup.gif" alt="About Sharing Excess" />
        <Spacer width={32} height={32} />
        <FlexContainer
          direction="vertical"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <Text type="paragraph" color="black">
            In communities around the country, food waste and hunger go hand in
            hand. While 10 million children go hungry each and every day,{' '}
            <strong>over 10 billion meals are thrown away</strong> annually.
          </Text>
          <Spacer height={24} />
          <Text type="paragraph" color="black">
            But as vast a problem as food waste is, the solution often boils
            down to simple last mile logistics and delivery.{' '}
            <span className="green">Sharing Excess</span> is meeting this
            challenge with the power of people, technology, and compassion.
          </Text>
        </FlexContainer>
      </FlexContainer>

      <Spacer height={isMobile ? 64 : 112} />

      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <FlexContainer
          direction="vertical"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <Text type="paragraph" color="black">
            Founded in Philadelphia in 2018, we work every day to fight food
            insecurity by delivering surplus from wholesalers, grocers,
            restaurants, and farmers to communities in need.
          </Text>
          <Spacer height={24} />
          <Text type="paragraph" color="black">
            By engaging the imagination of students and our own custom software
            to source and distribute surplus food, we&apos;ve rescued and
            distributed over{' '}
            <strong>
              <span className="green">4,000,000 lbs.</span> of food since 2018
            </strong>
            . Together with our 170+ local partners, Sharing Excess is building
            a uniquely scalable solution to an unthinkably large scale problem.
          </Text>
        </FlexContainer>
        <Spacer width={32} height={32} />
        <Image src="/about/billboard.gif" alt="About Sharing Excess" />
      </FlexContainer>

      <Spacer height={isMobile ? 64 : 96} />

      <FlexContainer
        id="About-section-buttons"
        fullWidth
        direction={isMobile ? 'vertical' : 'horizontal'}
      >
        <Button
          type={section === 'history' ? 'primary' : 'secondary'}
          color="green"
          size="large"
          handler={() => setSection('history')}
          fullWidth={isMobile}
        >
          Our History
        </Button>
        <Button
          type={section === 'team' ? 'primary' : 'secondary'}
          color="green"
          size="large"
          handler={() => setSection('team')}
          fullWidth={isMobile}
        >
          Meet the Team
        </Button>
        <Button
          type={section === 'partners' ? 'primary' : 'secondary'}
          color="green"
          size="large"
          handler={() => setSection('partners')}
          fullWidth={isMobile}
        >
          Our Partners
        </Button>
      </FlexContainer>

      <Spacer height={isMobile ? 48 : 64} />

      {section === 'team' && (
        <section id="About-team">
          <FlexContainer
            id="About-section-header"
            secondaryAlign="center"
            primaryAlign="center"
          >
            <Image src="/about/team.png" alt="Sharing Excess Team" />
            <Text type="primary-header" color="white" shadow>
              Meet the team!
            </Text>
          </FlexContainer>

          <Spacer height={isMobile ? 24 : 48} />

          <Text type="paragraph" color="black">
            Sharing Excess is a lean startup team, proudly powered by passionate
            college students and recent grads. The crew consists of folks
            working in full-time, part-time, co-op, internship, and volunteer
            positions. Collaborating remotely around from anywhere, our work has
            proven that college students can play a vital role in solving one of
            the world&apos;s greatest problems.
          </Text>

          <Spacer height={isMobile ? 24 : 48} />

          <div className="About-team-members">
            {team.map(i => (
              <div key={i.name} className="About-team-person">
                <Image src={i.image} alt={i.name} />
                <Spacer height={12} />
                <Text type="subheader" color="green" align="center">
                  {i.name}
                </Text>
                <Text type="small" color="black" align="center">
                  {i.title}
                </Text>
              </div>
            ))}
          </div>

          <Spacer height={isMobile ? 32 : 64} />

          <FlexContainer direction="vertical">
            <Text type="secondary-header" color="green" align="center">
              Looking to get involved?!?
            </Text>

            <Spacer height={16} />

            <Text type="paragraph" color="black">
              Whether you can drive a car, organize volunteers, or write
              jAvAScRIPT, <strong>we can use your help!</strong> Use the forms
              below to reach out to our team and we&apos;ll be sure to get back
              to you as soon as humanly possible.
            </Text>
            <Spacer height={16} />
          </FlexContainer>
          <Spacer height={isMobile ? 24 : 48} />
          <section id="About-team-volunteer">
            {volunteering.map(c => (
              <div key={c.header}>
                <Image src={c.image} alt={c.header} />
                <Spacer height={24} />
                <Text type="secondary-header" color="black" align="center">
                  {c.header}
                </Text>
                <Spacer height={8} />
                <Text type="small" color="grey" align="center">
                  {c.body}
                </Text>
                <Spacer height={16} />
                <Button type="primary" size="medium" color="green">
                  {c.button}
                </Button>
              </div>
            ))}
          </section>
        </section>
      )}

      {section === 'history' && (
        <section id="About-history">
          <FlexContainer
            id="About-section-header"
            secondaryAlign="center"
            primaryAlign="center"
          >
            <Image src="/about/history.png" alt="Sharing Excess Team" />
            <Text type="primary-header" color="white" shadow>
              How We Got Here
            </Text>
          </FlexContainer>

          <Spacer height={isMobile ? 24 : 48} />

          <Text type="paragraph" color="black">
            Since we got started in 2018, we&apos;ve grown from a simple
            donation of meal swipes to a team of more than 50 employees and
            volunteers.
          </Text>
        </section>
      )}

      {section === 'partners' && (
        <section id="About-partners">
          <FlexContainer
            id="About-section-header"
            secondaryAlign="center"
            primaryAlign="center"
          >
            <Image src="/about/partners.png" alt="Sharing Excess Team" />
            <Text type="primary-header" color="white" shadow>
              Our Partners
            </Text>
          </FlexContainer>

          <Spacer height={isMobile ? 24 : 48} />

          <Text type="paragraph" color="black">
            It&apos;s actually just Evan&apos; family and nobody else and he has
            just managed to hide that this entire time... pretty cool :shrug:
          </Text>
        </section>
      )}
    </div>
  )
}
