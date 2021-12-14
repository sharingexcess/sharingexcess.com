import React, { FC } from 'react'

export const Timeline: FC = () => {
  const sections: any = [
    {
      title: 'section 1',
      description: 'hello world',
      body: 'this is a paragraph of text',
      image: '/logos/green.png',
    },
    {
      title: 'section 2',
      description: 'hello world',
      body: 'this is a paragraph of text',
      image: '/logos/green.png',
    },
  ]

  function TimelineSection({ section }) {
    return (
      <section className="Timeline-section">
        {/* TODO: complete this component with styling */}
        {section.title}
      </section>
    )
  }

  return (
    <div id="Timeline">
      {sections.map((section: any) => (
        <TimelineSection key={section.title} section={section} />
      ))}
    </div>
  )
}
