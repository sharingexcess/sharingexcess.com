import type { AppProps } from 'next/app'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import 'styles/globals.scss'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
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
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
