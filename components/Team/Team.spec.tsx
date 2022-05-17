import React from 'react'
import { shallow } from 'enzyme'
import { Team } from './Team'

describe('Team', () => {
  const wrapper = shallow(<Team />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Team')
    expect(c.length).toBe(1)
  })
})
