import React from 'react'
import { shallow } from 'enzyme'
import { Button } from './Button'

describe('Button', () => {
  const wrapper = shallow(<Button handler={() => {}}>Test</Button>)
  it('Should render without crashing.', () => {
    const c = wrapper.find('.izo-button')
    expect(c.length).toBe(1)
  })
})
