import React from 'react'
import { shallow } from 'enzyme'
import { Impact } from './Impact'

describe('Impact', () => {
  const wrapper = shallow(<Impact />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Impact')
    expect(c.length).toBe(1)
  })
})
