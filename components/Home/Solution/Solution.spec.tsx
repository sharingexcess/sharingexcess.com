import React from 'react'
import { shallow } from 'enzyme'
import { Solution } from './Solution'

describe('Solution', () => {
  const wrapper = shallow(<Solution />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Solution')
    expect(c.length).toBe(1)
  })
})
