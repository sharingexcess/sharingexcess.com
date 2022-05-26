import React from 'react'
import { shallow } from 'enzyme'
import { Partners } from './Partners'

describe('Partners', () => {
  const wrapper = shallow(<Partners />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Partners')
    expect(c.length).toBe(1)
  })
})
