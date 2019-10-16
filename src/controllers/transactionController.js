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
    if (!validateRes.valid)
      res.send({ status: 400, error: validateRes })
    else {
      const response = await transactions.performTransaction(transactionObj, validateRes.sourceUser, validateRes.targetUser)
      res.send(response)
    }
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

    //retrieve target account 
    query[wallet] = transactionObj.targetUserId

    let [targetUser, err2] = await of(user.findOne({ where: query }))
    if (!(targetUser !== null && targetUser !== '')) {
      return { valid: false, message: 'DB Error', error: err1 }
    }
    targetUser = targetUser.dataValues

    //check for accepting max currency by target
    if (targetUser[max] < transactionObj.currencyAmount) {
      return { valid: false, message: 'Transaction amount greater than limit' }
    }
    //if all pass return valid signal
    return { valid: true, sourceUser, targetUser, message: 'Transaction valid' }
  }
  static async performTransaction(transactionObj, sourceUser, targetUser) {
    //update source user account 
    let sourceUpdate = {}
    sourceUpdate[balance] = sourceUser[balance] - transactionObj.currencyAmount
    let query = {}
    query[wallet] = sourceUser[wallet]

    insertDB = await of(user.update(sourceUpdate, { where: query }))
    if (insertDB[1]) {
      return { status: 500, error: insertDB[1] }
    }

    //update target user account
    let targetUpdate = {}
    targetUpdate[balance] = targetUser[balance] + transactionObj.currencyAmount
    query[wallet] = sourceUser[wallet]

    insertDB = await of(user.update(targetUpdate, { where: query }))
    if (insertDB[1]) {
      return { status: 500, error: insertDB[1] }
    }
  }
}
