import React from 'react'
import { shallow } from 'enzyme'
import { Header } from './Header'

describe('Header', () => {
  const wrapper = shallow(<Header />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Header')
    expect(c.length).toBe(1)
  })
})
