import React from 'react'
import { shallow } from 'enzyme'
import { Image } from './Image'

describe('Image', () => {
  const wrapper = shallow(<Image src="path/to/image.png" alt="Test Image" />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#Image')
    expect(c.length).toBe(1)
  })
})
