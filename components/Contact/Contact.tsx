import React, { FC, useEffect, useState } from 'react'
import { useForm } from '@formspree/react'
import { PageHeader } from 'components'
import { Text, Spacer } from '@sharingexcess/designsystem'
import validator from 'validator'
import { useIsMobile } from 'hooks'

// For our contact form, we use a free service called FormSpree
// Here's the link to our form:
// https://formspree.io/forms/xeqnjkaq/integration

// And here's the link to all FormSpree React Docs:
// https://help.formspree.io/hc/en-us/articles/360055613373-The-Formspree-React-library

interface formContent {
  name: string | undefined
  email: string | undefined
  phone: string | undefined
  reason: string | undefined
  message: string | undefined
}

const initFormData = {
  name: undefined,
  email: undefined,
  phone: undefined,
  reason: undefined,
  message: undefined,
}

export const Contact: FC = () => {
  const isMobile = useIsMobile()
  const [state, handleSubmit] = useForm('xeqnjkaq')
  const [formData, setFormData] = useState<formContent>(initFormData)

  useEffect(() => {
    if (state.succeeded) {
      setFormData(initFormData)
    }
  }, [state.succeeded])

  function handleChange(e: any) {
    setFormData(data => ({ ...data, [e.target.id]: e.target.value }))
  }

  function validateText(text: any) {
    if (typeof text === 'string') {
      return text.length ? 'valid' : 'invalid'
    } else return undefined
  }

  function validateEmail() {
    if (typeof formData.email === 'string') {
      console.log(validator.isEmail(formData.email))
      return validator.isEmail(formData.email) ? 'valid' : 'invalid'
    } else return undefined
  }

  function isFormComplete() {
    return (
      formData.name && formData.email && formData.reason && formData.message
    )
  }

  return (
    <main id="Contact">
      <PageHeader
        label="GET IN TOUCH"
        title="We simply can NOT wait to hear from you!"
        image={
          isMobile ? '/headers/contact_mobile.png' : '/headers/contact.png'
        }
      />
      <Spacer height={32} />
      <Text type="secondary-header" color="green">
        Reach out to the Team
      </Text>
      <Spacer height={16} />
      <Text>
        Looking to get involved? Have food to donate? Want to learn more about
        us?
      </Text>
      <Spacer height={8} />
      <Text>
        Use the form below to get in touch and tell us more about yourself, and
        we will literally race to get back to you.*
      </Text>
      <Spacer height={16} />
      <Text type="small" className="Contact-italics" color="green">
        * No, seriously. This form sends emails to all of us, and we do keep
        score who responds first.
      </Text>
      <form onSubmit={handleSubmit}>
        <div className="Contact-form-group">
          <label htmlFor="name">Your Name*</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={validateText(formData.name)}
          />
        </div>
        <div className="Contact-form-group">
          <label htmlFor="email">Email Address*</label>
          <input
            id="email"
            type="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            className={validateEmail()}
          />
        </div>
        <div className="Contact-form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={formData.phone ? 'valid' : undefined}
          />
        </div>
        <div className="Contact-form-group">
          <label htmlFor="reason">I&apos;m looking to...*</label>
          <select
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className={validateText(formData.reason)}
          >
            <option></option>
            <option value="Volunteer as a Driver">Volunteer as a Driver</option>
            <option value="Donate Food">Donate Food</option>
            <option value="Join the Sharing Excess Crew">
              Join the Sharing Excess Crew
            </option>
            <option value="Make a Financial Contribution">
              Make a Financial Contribution
            </option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="Contact-form-group">
          <label htmlFor="message">Your Message*</label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            className={validateText(formData.message)}
          />
        </div>
        <Spacer height={8} />
        <button
          type="submit"
          className="se-button type-primary size-medium color-green"
          disabled={state.submitting || !isFormComplete()}
        >
          Submit!
        </button>
      </form>
      {state.succeeded && (
        <Text type="paragraph" align="center" color="grey">
          Got it! Thank you so much for reaching out - the Sharing Excess team
          will get back to you ASAP.
        </Text>
      )}
    </main>
  )
}
