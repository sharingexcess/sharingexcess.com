import React from 'react'
import { shallow } from 'enzyme'
import { Campus } from './Campus'

describe('Campus', () => {
  const wrapper = shallow(<Campus />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Campus')
    expect(c.length).toBe(1)
  })
})
