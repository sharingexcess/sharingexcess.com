import React from 'react'
import { shallow } from 'enzyme'
import { Volunteer } from './Volunteer'

describe('Volunteer', () => {
  const wrapper = shallow(<Volunteer />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Volunteer')
    expect(c.length).toBe(1)
  })
})
