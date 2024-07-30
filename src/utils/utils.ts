function generate4DigitRandomNumber() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export { generate4DigitRandomNumber };
