import React from 'react'
import { shallow } from 'enzyme'
import { Splash } from './Splash'

describe('Splash', () => {
  const wrapper = shallow(<Splash />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Splash')
    expect(c.length).toBe(1)
  })
})
