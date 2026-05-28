let chalk;
try {
  chalk = require('chalk');
} catch (_) {
  chalk = null;
}

function color(method, value) {
  if (!chalk || !chalk[method]) return value;
  return chalk[method](value);
}

module.exports = {
  info: (msg) => console.log(color('cyan', msg)),
  success: (msg) => console.log(color('green', msg)),
  warn: (msg) => console.warn(color('yellow', msg)),
  error: (msg) => console.error(color('red', msg)),
  plain: (msg) => console.log(msg),
  dim: (msg) => console.log(color('gray', msg)),
  format: {
    green: (msg) => color('green', msg),
    yellow: (msg) => color('yellow', msg),
    red: (msg) => color('red', msg),
    cyan: (msg) => color('cyan', msg),
    bold: (msg) => chalk && chalk.bold ? chalk.bold(msg) : msg,
    gray: (msg) => color('gray', msg)
  }
};
