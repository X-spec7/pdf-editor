import localFont from "next/font/local"

// Load custom handwriting fonts
export const bastliga = localFont({
  src: "../public/fonts/bastliga.otf",
  variable: "--font-bastliga",
  display: "swap",
})

export const centralwell = localFont({
  src: "../public/fonts/centralwell.ttf",
  variable: "--font-centralwell",
  display: "swap",
})

export const handwritingFonts = [
  { name: "Bastliga", variable: "--font-bastliga", fontFamily: "var(--font-bastliga)" },
  { name: "Centralwell", variable: "--font-centralwell", fontFamily: "var(--font-centralwell)" },
]

