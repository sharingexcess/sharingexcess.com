import { FlexContainer, Spacer, Text, Image } from '@sharingexcess/designsystem'
import { PageHeader } from 'components'
import { useIsMobile } from 'hooks'
import { team } from 'content/team'
import React, { FC } from 'react'
import { testimonials } from 'content/testimonials'
import { Card } from 'designsystem'
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
  return (
    <div id="Team">
      <PageHeader
        image={isMobile ? '/headers/about_mobile.jpeg' : '/headers/team.png'}
        label="meet the team"
        title={`Collaborating and volunteering.`}
      />

      <Spacer height={isMobile ? 96 : 48} />
      <FlexContainer direction="vertical" className="Team-header-text">
        <Text type="secondary-header" color="green">
          Who We Are
        </Text>
        <Spacer height={32} />
        <Text type="paragraph" color="black" align="center">
          Sharing Excess is a lean startup team, proudly powered by passionate
          college students and recent grads. The crew consists of folks working
          in full-time, part-time, co-op, internship, and volunteer positions.
        </Text>
        <Spacer height={98} />
      </FlexContainer>

      <FlexContainer direction="vertical">
        {departments.map(department => {
          return (
            <FlexContainer direction="vertical">
              <Text type="small-header" color="green" id="Team-small-header">
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
                        <a href={filteredTeamMember.url} target="_blank">
                          {filteredTeamMember.name}
                        </a>
                      </Text>

                      <Text type="small" color="black" align="center">
                        {filteredTeamMember.title}
                      </Text>
                    </div>
                  ))}
              </div>
              <Spacer height={176} />
            </FlexContainer>
          )
        })}
      </FlexContainer>

      <FlexContainer direction="vertical" className="Team-header-text">
        <Text type="secondary-header" color="black" align="center">
          Sharing Excess hires students.
        </Text>
      </FlexContainer>
      <Spacer height={62} />

      <FlexContainer
        direction="horizontal"
        className="Team-testimonials-section"
      >
        <Image
          src="/team/testimonials-bg.svg"
          alt="Background color"
          id="Team-testimonials-background-img"
        />
        <Text type="small-header" color="black">
          Powered by students.
        </Text>
        {
          <section id="Team-testimonial">
            <CarouselProvider
              naturalSlideWidth={100}
              naturalSlideHeight={125}
              totalSlides={testimonials.length}
              visibleSlides={1}
            >
              <Slider>
                {testimonials.map((student, i) => (
                  <Slide index={i} className="testimonial-card">
                    <Card>
                      <Image src={student.image} alt={student.name}></Image>
                      <Spacer height={12} />
                      <Text type="subheader" color="green" align="center">
                        {student.name}
                      </Text>
                      <Text type="paragraph" color="black" align="center">
                        {student.title}
                      </Text>

                      <Spacer height={32} />
                      <Text type="paragraph" color="black" align="left">
                        {student.quote}
                      </Text>
                    </Card>
                  </Slide>
                ))}
              </Slider>

              {/* <ButtonBack>Back</ButtonBack>
              <ButtonNext>Next</ButtonNext> */}
              <DotGroup />
            </CarouselProvider>
          </section>
        }
      </FlexContainer>
    </div>
  )
}
