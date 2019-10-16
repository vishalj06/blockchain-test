import { default as models } from '../models/index';
import of from 'await-of';

const { user } = models;
export default class users {
  static async createUser(req, res) {

    console.log('Inserting user', req.body)
    let [response, err] = await of(user.create(req.body))
    if (err) res.send({ status: 500, error: err })
    else res.send({ status: 201, Response: response })
  }
}
