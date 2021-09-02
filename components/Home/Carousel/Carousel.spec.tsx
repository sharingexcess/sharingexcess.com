import React from 'react'
import { shallow } from 'enzyme'
import { Carousel } from './Carousel'

describe('Carousel', () => {
  const wrapper = shallow(<Carousel />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Carousel')
    expect(c.length).toBe(1)
  })
})
