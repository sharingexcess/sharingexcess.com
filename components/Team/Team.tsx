import { FlexContainer, Spacer, Text, Image } from '@sharingexcess/designsystem'
import { PageHeader } from 'components'
import { useIsMobile } from 'hooks'
import { team } from 'content/team'
import React, { FC } from 'react'

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
      <FlexContainer direction="vertical" id="Team-text">
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
        <Text type="small-header" color="green" id="Team-small-header">
          leadership
        </Text>
        <Spacer height={48} />
      </FlexContainer>

      <div className="About-team-members">
        {/* 
        add field to team that has category
        then higher order function sort by category */}

        {team.map((i, j) => (
          <div key={i.name} className="About-team-person">
            <Image src={i.image} alt={i.name} />
            <Spacer height={12} />

            <Text
              type="subheader"
              color="blue"
              align="center"
              id="About-team-person-name"
            >
              <a href={i.url} target="_blank">
                {i.name}
              </a>
            </Text>

            <Text type="small" color="black" align="center">
              {i.title}
            </Text>
          </div>
        ))}
      </div>

      <FlexContainer direction="vertical" id="Team-text">
        <Spacer height={98} />
        <Text type="small-header" color="green" id="Team-small-header">
          distribution
        </Text>
      </FlexContainer>

      <FlexContainer direction="vertical" id="Team-text">
        <Spacer height={98} />
        <Text type="small-header" color="green" id="Team-small-header">
          operations
        </Text>
      </FlexContainer>

      <FlexContainer direction="vertical" id="Team-text">
        <Spacer height={98} />
        <Text type="small-header" color="green" id="Team-small-header">
          technology
        </Text>
      </FlexContainer>

      <FlexContainer direction="vertical" id="Team-text">
        <Spacer height={178} />
        <Text type="secondary-header" color="green">
          Experiential Learning Program
        </Text>
      </FlexContainer>
      <FlexContainer direction="vertical" id="Team-text">
        <Text type="secondary-header" color="black">
          Student Stories
        </Text>
      </FlexContainer>
    </div>
  )
}
