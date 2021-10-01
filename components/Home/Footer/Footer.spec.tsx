import React from 'react'
import { shallow } from 'enzyme'
import { Footer } from './Footer'

describe('Footer', () => {
  const wrapper = shallow(<Footer />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Footer')
    expect(c.length).toBe(1)
  })
})
