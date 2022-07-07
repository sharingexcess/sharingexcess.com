import React, { FC } from 'react'
import { PageHeader } from 'components/PageHeader/PageHeader'
import { useIsMobile } from 'hooks'

export const Volunteer: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="Volunteer">
      <PageHeader
        image="/about/blog-img.jpg"
        label="Volunteer"
        title="Come help us change the food waste equation."
      />
      <iframe
        id="frame"
        name="frame"
        src={
          isMobile
            ? 'https://sharingexcess.cervistech.com/acts/console.php?console_type=event&console_id=0385&cat_id=&filter_choice=&cal_choice=&res_choice=&res_code=&source='
            : 'https://sharingexcess.cervistech.com//acts/webreg/eventwebreglist.php?org_id=0385'
        }
      ></iframe>
    </div>
  )
}
