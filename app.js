import express from 'express';

import { urlencoded, json } from 'body-parser';
import  morgan from 'morgan';

import session from 'cookie-session';
import routes from './src/routes/index';

const app = express();
app.use(session({ secret: 'sessionsecret' }));
app.use(morgan('dev'));

app.use(urlencoded({ extended: false }));
app.use(json());

app.set('views', `${__dirname}/public`);
app.set('view engine', 'ejs');
app.use(express.static('../public'));

app.use('/', routes);
app.listen(3000, () => {
  console.log('listening at 3000')
});
