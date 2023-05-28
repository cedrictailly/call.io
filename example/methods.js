
exports.addNumbers = (a, b) => a + b;

exports.fetch = url => fetch(url).then(res => res.text());

exports.throwError = (a, b) => {
  throw new Error("This is an error");
};
