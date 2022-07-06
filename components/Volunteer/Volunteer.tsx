import React, { FC, useEffect } from 'react'
import Script from 'next/script'
import { PageHeader } from 'components/PageHeader/PageHeader'

export const Volunteer: FC = () => {
  return (
    <div id="Volunteer">
      <PageHeader
        image="/about/blog-img.jpg"
        label="Volunteer"
        title="Come help us change the food waste equation."
      />
      <Script
        type="text/javascript"
        src="https://cdn.cervistech.com/acts/javascript/resize.js"
      />
      <iframe
        id="frame"
        name="frame"
        src="https://sharingexcess.cervistech.com//acts/webreg/eventwebreglist.php?org_id=0385"
      ></iframe>
    </div>
  )
}
