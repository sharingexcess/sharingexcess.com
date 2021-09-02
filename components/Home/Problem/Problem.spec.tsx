import React from 'react'
import { shallow } from 'enzyme'
import { Problem } from './Problem'

describe('Problem', () => {
  const wrapper = shallow(<Problem />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Problem')
    expect(c.length).toBe(1)
  })
})
