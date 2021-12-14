import React from 'react'
import { shallow } from 'enzyme'
import { Timeline } from './Timeline'

describe('Timeline', () => {
  const wrapper = shallow(<Timeline />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Timeline')
    expect(c.length).toBe(1)
  })
})
