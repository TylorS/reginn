// foreground colors
export const black = modifier(30, 39)
export const red = modifier(31, 39)
export const green = modifier(32, 39)
export const yellow = modifier(33, 39)
export const blue = modifier(34, 39)
export const magenta = modifier(35, 39)
export const cyan = modifier(36, 39)
export const white = modifier(37, 39)
export const gray = modifier(90, 39)

// modifiers
export const reset = modifier(0, 0)
export const bold = modifier(1, 22)
export const dim = modifier(2, 22)
export const italic = modifier(3, 23)
export const underline = modifier(4, 24)
export const inverse = modifier(7, 27)
export const hidden = modifier(8, 28)
export const strikeThrough = modifier(9, 29)

// backgrounds
export const bgBlack = modifier(40, 49)
export const bgRed = modifier(41, 49)
export const bgGreen = modifier(42, 49)
export const bgYellow = modifier(43, 49)
export const bgBlue = modifier(44, 49)
export const bgMagenta = modifier(45, 49)
export const bgCyan = modifier(46, 49)
export const bgWhite = modifier(47, 49)

export function modifier (open, close) {
  return function (str) {
    return '\u001b[' + open + 'm' + '\u001b[' + close + 'm'
  }
}
