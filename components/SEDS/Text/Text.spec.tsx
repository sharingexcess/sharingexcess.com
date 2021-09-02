import React from 'react'
import { shallow } from 'enzyme'
import { Text } from './Text'

describe('Text', () => {
  const wrapper = shallow(<Text>Hello World</Text>)
  it('Should render without crashing.', () => {
    const c = wrapper.find('.izo-text')
    expect(c.length).toBe(1)
  })
})
