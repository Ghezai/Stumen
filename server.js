const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

const app = express();


app.use(express.json({ extended: false}));

dotenv.config({ path:'./config/config.env'});

connectDB();

app.get('/', (req, res) => res.send('This API Running ኣገዳሲ ሓበሬታ ኮረና ንነበርቲ ኖርወይ ...'));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
