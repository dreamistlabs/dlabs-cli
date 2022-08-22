import Placeholder from './lib/Placeholder';

describe('Placeholder#greetings', () => {
  test('returns a greeting message', () => {
    const instance = new Placeholder();
    const result = instance.greetings();

    expect(result).toContain('You are a rockstar');
  });
});
