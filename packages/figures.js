const isWindows = process.platform === 'win32'

export const cross = isWindows ? '×' : '✖'
