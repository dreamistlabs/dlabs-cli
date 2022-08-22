module.exports = {
  createPromptModule: () => {
    return async userQuestions => {
      return await Promise.resolve(
        userQuestions.reduce((acc, curr) => {
          acc[curr.name] = curr.value;

          return acc;
        }, {})
      );
    };
  },
};
