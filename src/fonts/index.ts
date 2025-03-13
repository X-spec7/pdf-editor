// Export font information for use in components
export const customFonts = [
  {
    name: "DancingFont",
    fontFamily: "DancingFont, cursive",
    variable: "dancingfont",
  },
];

// Combined fonts (custom + web fonts)
export const handwritingFonts = [
  { name: "Helvetica", fontFamily: "Helvetica, sans-serif", variable: "helvetica" },

  ...customFonts,
];
