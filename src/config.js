module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: `https://tr-bot-project.vercel.app`,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://joe_dickey@localhost/tr-bot',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://joe_dickey@localhost/tr-bot-test'
  }