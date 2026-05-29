function push(result, kind, code, message, details = {}) {
  result[kind].push({ code, message, ...details });
}

module.exports = { push };
