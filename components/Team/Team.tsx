import {
  FlexContainer,
  Spacer,
  Text,
  Image,
  Card,
  Button,
} from '@sharingexcess/designsystem'
import { PageHeader } from 'components'
import { useIsMobile, useWidth } from 'hooks'
import { team } from 'content/team'
import React, { FC } from 'react'
import { testimonials } from 'content/testimonials'
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  DotGroup,
} from 'pure-react-carousel'
import 'pure-react-carousel/dist/react-carousel.es.css'

const departments = [
  'leadership',
  'distribution',
  'operations',
  'community',
  'technology',
]

export const Team: FC = () => {
  const isMobile = useIsMobile()
  const width = useWidth()
  return (
    <div id="Team">
      <PageHeader
        image={isMobile ? '/headers/about_mobile.jpeg' : '/headers/team.png'}
        label="meet the team"
        title={`Working together to make an impact in our community.`}
      />

      <Spacer height={isMobile ? 48 : 96} />
      <FlexContainer
        id="Team-intro"
        direction={isMobile ? 'vertical' : 'horizontal'}
      >
        <Image src="/about/who-we-are.jpg" alt="Team" />
        <Spacer width={48} />
        <FlexContainer
          direction="vertical"
          secondaryAlign="start"
          className="Team-header-text"
        >
          <Text type="secondary-header" color="green">
            Who We Are
          </Text>
          <Spacer height={isMobile ? 18 : 32} />
          <Text type="paragraph" color="black" align="left">
            Sharing Excess is a lean nonprofit startup team, proudly powered by
            passionate college students and recent grads.
            <Spacer height={16} />
            Our crew consists of folks working in full-time, part-time, co-op,
            internship, and volunteer positions. And hey, we're always looking
            for new folks to come on board ;)
          </Text>
        </FlexContainer>
      </FlexContainer>

      <Spacer height={isMobile ? 96 : 128} />

      <FlexContainer direction="vertical">
        {departments.map(department => (
          <FlexContainer direction="vertical" key={department}>
            <Text
              type="small-header"
              color="green"
              classList={['Team-small-header']}
            >
              {department}
            </Text>
            <Spacer height={48} />

            <div className="Team-members">
              {team
                .filter(teamMember => teamMember.department === department)
                .map(filteredTeamMember => (
                  <div key={filteredTeamMember.name} className="Team-person">
                    <Image
                      src={filteredTeamMember.image}
                      alt={filteredTeamMember.name}
                    />
                    <Spacer height={12} />

                    <Text
                      type="subheader"
                      color="blue"
                      align="center"
                      id="Team-person-name"
                    >
                      <a
                        href={filteredTeamMember.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {filteredTeamMember.name}
                      </a>
                    </Text>

                    <Text type="small" color="black" align="center">
                      {filteredTeamMember.title}
                    </Text>
                  </div>
                ))}
            </div>
          </FlexContainer>
        ))}
      </FlexContainer>

      <Spacer height={64} />

      <FlexContainer
        direction={isMobile ? 'vertical' : 'horizontal'}
        className="Team-testimonials"
      >
        <FlexContainer
          direction="vertical"
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <Text
            type="secondary-header"
            color="black"
            align={isMobile ? 'center' : 'left'}
          >
            Get Involved @ SE
          </Text>
          <Spacer height={16} />
          <Text color="black" align={isMobile ? 'center' : 'left'}>
            We're <b>currently hiring</b> across all departments, with flexible
            options to fit the needs of students and professionals that can help
            us grow and expand.
          </Text>
          <Spacer height={8} />
          <FlexContainer primaryAlign={isMobile ? 'center' : 'start'}>
            <ul>
              <li>Full Time</li>
              <li>Part Time</li>
              <li>Board Members</li>
            </ul>
            <ul>
              <li>Internships</li>
              <li>Co-ops</li>
              <li>Volunteers</li>
            </ul>
          </FlexContainer>
          <Text color="black" align={isMobile ? 'center' : 'left'}>
            Join a young and energetic team working to change the food waste
            equation in our local communities.
          </Text>
          <Spacer height={24} />
          <a href="/contact">
            <Button color="green">Reach Out to Learn More</Button>
          </a>
        </FlexContainer>
        <Spacer width={64} height={64} />
        {
          <section id="Team-testimonial">
            <CarouselProvider
              naturalSlideWidth={100}
              naturalSlideHeight={
                isMobile ? 120 : Math.min(100000 / (width || 1000), 72)
              }
              totalSlides={testimonials.length}
              visibleSlides={1}
            >
              <ButtonBack id="Team-testimonials-back">&lt;</ButtonBack>
              <Slider>
                {testimonials.map((student, i) => (
                  <Slide index={i} className="testimonial-card" key={i}>
                    <div className="Team-testimonials-card">
                      <Card>
                        <Image src={student.image} alt={student.name}></Image>
                        <Spacer height={12} />
                        <Text type="subheader" color="green" align="center">
                          {student.name}
                        </Text>
                        <Text type="small" color="black" align="center">
                          {student.title}
                        </Text>

                        <Spacer height={16} />
                        <Text type="small" color="black" align="center">
                          "<i>{student.quote}</i>""
                        </Text>
                      </Card>
                    </div>
                  </Slide>
                ))}
              </Slider>
              <ButtonNext id="Team-testimonials-next">&gt;</ButtonNext>
              <DotGroup />
            </CarouselProvider>
          </section>
        }
      </FlexContainer>
    </div>
  )
}
