import React from 'react'
import { shallow } from 'enzyme'
import { Spacer } from './Spacer'

describe('Spacer', () => {
  const wrapper = shallow(<Spacer />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Spacer')
    expect(c.length).toBe(1)
  })
})
