import { Playfair_Display, Caveat } from 'next/font/google'

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
})
