import { default as models } from '../models/index';
import of from 'await-of';

const { user, transaction } = models;
let insertDB
const currencies = ['bitcoin', 'ethereum']
let balance, wallet, max, currency
export default class transactions {
  static async validateAndPerformTransaction(req, res) {
    let transactionObj = req.body
    currency = transactionObj.currencyType
    balance = currency + 'Balance'
    wallet = currency + 'Wallet'
    max = 'max' + currency.charAt(0).toUpperCase() + currency.slice(1)

    transactionObj.createdAt = Date.now();
    const validateRes = await transactions.validateTransaction(transactionObj)
    res.send(validateRes)
  }

  static async validateTransaction(transactionObj) {
    //currency check
    if (!currencies.includes(currency)) return { valid: false, message: 'Invalid Currency' }
    // zero amount check
    if (transactionObj.currencyAmount <= 0) return { valid: false, message: 'Invalid Amount' }

    //retrieve source user account from DB
    let query = {}
    query[wallet] = transactionObj.sourceUserId
    let [sourceUser, err1] = await of(user.findOne({ where: query }))

    if (!(sourceUser !== null && sourceUser !== '')) {
      return { valid: false, message: 'DB Error', error: err1 }
    }
    sourceUser = sourceUser.dataValues

    //check if transaction amount is less than max
    if (sourceUser[max] < transactionObj.currencyAmount)
      return { valid: false, message: 'Transaction amount greater than limit' }
    //check account have sufficient balance 
    if (sourceUser[balance] < transactionObj.currencyAmount)
      return { valid: false, message: 'Insufficient Balance' }
  }
}
