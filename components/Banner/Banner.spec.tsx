import React from 'react'
import { shallow } from 'enzyme'
import { Banner } from './Banner'

describe('Banner', () => {
  const wrapper = shallow(<Banner />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Banner')
    expect(c.length).toBe(1)
  })
})
