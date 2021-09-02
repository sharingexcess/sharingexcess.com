import React from 'react'
import { shallow } from 'enzyme'
import { Input } from './Input'

describe('Input', () => {
  const wrapper = shallow(
    <Input label="Test Input" value="test" onChange={() => {}} />
  )
  it('Should render without crashing.', () => {
    const c = wrapper.find('.izo-input')
    expect(c.length).toBe(1)
  })
})
