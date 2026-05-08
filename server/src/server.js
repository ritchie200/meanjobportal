const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
