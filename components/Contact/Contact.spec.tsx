import React from 'react'
import { shallow } from 'enzyme'
import { Contact } from './Contact'

describe('Contact', () => {
  const wrapper = shallow(<Contact />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Contact')
    expect(c.length).toBe(1)
  })
})
