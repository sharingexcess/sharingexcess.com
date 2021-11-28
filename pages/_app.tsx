import type { AppProps } from 'next/app'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import 'styles/globals.scss'
import { initializeApp } from 'firebase/app'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

Sentry.init({
  dsn: 'https://43c8f67fd12341ae80e7c512807f6c30@o1079715.ingest.sentry.io/6084786',
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: process.env.SENTRY_ENV || 'development',
})

const firebaseConfig = {
  apiKey: 'AIzaSyCtfJwIfZEuejWShXm3qSL3s1hcDsk7RDo',
  authDomain: 'sharingexcessdotcom.firebaseapp.com',
  projectId: 'sharingexcessdotcom',
  storageBucket: 'sharingexcessdotcom.appspot.com',
  messagingSenderId: '1040336322996',
  appId: '1:1040336322996:web:1b75b53586bd739b1d72e1',
  measurementId: 'G-T9PH0W5HXJ',
}

// Initialize Firebase
initializeApp(firebaseConfig)

// eslint-disable-next-line
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
