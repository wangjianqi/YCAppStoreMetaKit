const pc = require('picocolors');

function shouldColor() {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR === '0') return false;
  return pc.isColorSupported;
}

module.exports = {
  info: (msg) => console.log(shouldColor() ? pc.cyan(msg) : msg),
  success: (msg) => console.log(shouldColor() ? pc.green(msg) : msg),
  warn: (msg) => console.warn(shouldColor() ? pc.yellow(msg) : msg),
  error: (msg) => console.error(shouldColor() ? pc.red(msg) : msg),
  plain: (msg) => console.log(msg),
  dim: (msg) => console.log(shouldColor() ? pc.gray(msg) : msg),
  format: {
    green: (msg) => shouldColor() ? pc.green(msg) : msg,
    yellow: (msg) => shouldColor() ? pc.yellow(msg) : msg,
    red: (msg) => shouldColor() ? pc.red(msg) : msg,
    cyan: (msg) => shouldColor() ? pc.cyan(msg) : msg,
    bold: (msg) => shouldColor() ? pc.bold(msg) : msg,
    gray: (msg) => shouldColor() ? pc.gray(msg) : msg
  }
};
