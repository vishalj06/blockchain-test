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
    if (!currencies.includes(currency)) return { valid: false, message: 'Invalid Currency' } 
    if (transactionObj.currencyAmount <= 0) return { valid: false, message: 'Invalid Amount' }  
  }
}
