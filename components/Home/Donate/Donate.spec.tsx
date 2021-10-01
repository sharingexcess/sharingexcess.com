import React from 'react'
import { shallow } from 'enzyme'
import { Donate } from './Donate'

describe('Donate', () => {
  const wrapper = shallow(<Donate />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Donate')
    expect(c.length).toBe(1)
  })
})
