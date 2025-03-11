// Export font information for use in components

export const customFonts = [
  {
    name: "Bastliga",
    fontFamily: "Bastliga, cursive",
    variable: "bastliga",
  },
  {
    name: "CentralWell",
    fontFamily: "CentralWell, cursive",
    variable: "centralwell"
  },
  {
    name: "DancingFont",
    fontFamily: "DancingFont, cursive",
    variable: "dancingfont"
  }
]

// Combined fonts (custom + web fonts)
export const handwritingFonts = [
  // Custom fonts first
  ...customFonts,

  // Web fonts
]
