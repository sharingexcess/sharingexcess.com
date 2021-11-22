import React from 'react'
import { shallow } from 'enzyme'
import { News } from './News'

describe('News', () => {
  const wrapper = shallow(<News />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#News')
    expect(c.length).toBe(1)
  })
})
