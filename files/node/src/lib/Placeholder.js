class Placeholder {
  constructor(name = 'User') {
    this.username = name;
  }

  greetings() {
    return `Greetings! You are a rockstar, ${this.username}.`;
  }
}

export default Placeholder;
