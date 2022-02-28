module.exports = {
  projects: [
    {
      displayName: 'Serial Test Cases',
      preset: 'jest-puppeteer',
      runner: 'jest-serial-runner',
      testMatch: ['<rootDir>/e2e/tests/**/?(*.)+(serial-test).js'],
    },
    {
      displayName: 'Parallel Test Cases',
      preset: 'jest-puppeteer',
      testMatch: ['<rootDir>/e2e/tests/**/*.test.js'],
    },
  ],
};
