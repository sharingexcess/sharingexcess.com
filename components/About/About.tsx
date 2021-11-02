import React, { FC } from 'react'
import Head from 'next/head'
import { Image, Spacer, Text } from '@sharingexcess/designsystem'
import { team } from 'content/team'

export const About: FC = () => {
  return (
    <div id="About">
      <Head>
        <title>About | Sharing Excess</title>
      </Head>
      <Text type="primary-header" color="white" shadow>
        Sharing Excess is a solution to scarcity.
      </Text>
      <Spacer height={32} />
      <Text type="paragraph" color="white">
        In communities everywhere, vital basic resources are going to waste,
        while people continue to suffer from the lack of those very same
        resources. This is a disconnect created by logistical barriers between
        excess and scarcity. If solved, this connection could ensure basic
        necessities for all people alive today.
      </Text>
      <Spacer height={24} />
      <Text type="paragraph" color="white">
        Sharing Excess is scaling human compassion to meet a global challenge
        that has existed long before this idea was born. Founded in Philadelphia
        Pennsylvania in 2018, our movement aims to address the crucial need for
        food by delivering regular surplus from grocers, restaurants,
        wholesalers, and farmers to communities experiencing food insecurity.
      </Text>
      <Spacer height={24} />
      <Text type="paragraph" color="white">
        By engaging the imagination of students, and the hearts of the people we
        serve, we have created a dynamic community that plays a unique role in
        regularly rescuing and distributing food excess to underserved areas.
        Together with our partners, clever logistics, and custom technologies,
        members of Sharing Excess aim to address needs within social margins
        that are unmet by current solutions.
      </Text>
      <Spacer height={48} />
      <Text type="section-header" color="white" shadow>
        And we think food waste is bananas…
      </Text>
      <Spacer height={24} />
      <Text type="paragraph" color="white">
        In the United States, nearly 40% of the food we produce goes to waste.
        That's approximately 120 billion pounds of food ending up in landfills
        each year; enough to fill more than 700 NFL stadiums from the ground to
        the very top with uneaten food. Food surplus is inevitable for
        producers, retailers, and consumers, but it often goes to waste for
        logistical reasons like poor inventory management, lack of affordable
        transportation, and non-standardized expiration dates.
      </Text>
      <Spacer height={24} />
      <Text type="paragraph" color="white">
        All the while, upwards of 40 million Americans experience food
        insecurity in our country. Considering the fact that 50-60% of U.S.
        residents are living paycheck to paycheck, food is often the first
        necessity to be jeopardized. Research shows that children and students
        are particularly vulnerable to food insecurity, as more than 10 million
        children live in food insecure households, and more than 40% of
        four-year college students regularly skip meals on a daily and weekly
        basis. Every single community in the United States is home to families
        that experience food insecurity, and often times, they are not eligible
        to receive federal support and must rely on food donations from
        shelters, food banks, and community organizations.
      </Text>
      <Spacer height={24} />
      <Text type="paragraph" color="white">
        Sharing Excess aims to solve this broken equation with innovative
        last-mile delivery, and big ideas that spread love, happiness, and
        compassion.
      </Text>
      <Spacer height={64} />
      <Text type="primary-header" color="white" shadow>
        Meet the team!
      </Text>
      <Spacer height={32} />
      <Text type="paragraph" color="white">
        Sharing Excess is proudly powered by passionate college students and
        recent grads. The crew consists of folks working in full-time,
        part-time, co-op, internship, and volunteer positions. The five
        departments that make the magic happen include Distribution, Technology,
        Campus, Finance, and Marketing. Collaborating remotely around from
        anywhere, we work year-round to support hundreds of thousands of people
        with free food. Our work has proven that college students can play a
        vital role in solving one of the world's greatest problems.
      </Text>
      <Spacer height={64} />
      <section id="About-team">
        {team.map(i => (
          <div key={i.name} className="About-team-person">
            <Image src={i.image} alt={i.name} />
            <Spacer height={12} />
            <Text type="subheader" color="white" shadow align="center">
              {i.name}
            </Text>
            <Text type="small" color="white" align="center">
              {i.title}
            </Text>
          </div>
        ))}
      </section>
    </div>
  )
}
