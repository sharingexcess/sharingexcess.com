import React from 'react'
import { shallow } from 'enzyme'
import { WaveBackground } from './WaveBackground'

describe('WaveBackground', () => {
  const wrapper = shallow(<WaveBackground />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#WaveBackground')
    expect(c.length).toBe(1)
  })
})
