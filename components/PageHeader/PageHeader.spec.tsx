import React from 'react'
import { shallow } from 'enzyme'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  const wrapper = shallow(<PageHeader />)
  it('Should render without crashing.', () => {
    const c = wrapper.find('#PageHeader')
    expect(c.length).toBe(1)
  })
})
