import React from 'react'
import { shallow } from 'enzyme'
import { About } from './About'

describe('About', () => {
  const wrapper = shallow(<About />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#About')
    expect(c.length).toBe(1)
  })
})
