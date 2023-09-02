import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
const appInsights = require('applicationinsights');
appInsights.setup('03bd38c3-e3bc-47b3-9973-ae5b4595fa02');
appInsights.start();
app.use(appInsights.requestHandler());
app.use(appInsights.errorHandler());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express.');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});