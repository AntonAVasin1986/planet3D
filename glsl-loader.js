module.exports = function(source) {
  return "module.exports = '" + source.replace(/(\/\/.*)/g, '').replace(/(?:\r\n|\r|\n)/g, ' ') + "'";
};