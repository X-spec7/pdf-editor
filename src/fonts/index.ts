// Export font information for use in components

export const customFonts = [
  {
    name: "Bastliga",
    fontFamily: "Bastliga, cursive",
    variable: "bastliga",
  },
  {
    name: "Central Well",
    fontFamily: "CentralWell, cursive",
    variable: "centralwell"
  }
]

// Combined fonts (custom + web fonts)
export const handwritingFonts = [
  // Custom fonts first
  ...customFonts,

  // Web fonts
]
