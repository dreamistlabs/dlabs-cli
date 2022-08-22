class DLError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DLError';
  }
}

export default DLError;
