import { default as models } from '../../models/index';
import of from 'await-of';
import Sequelize from 'sequelize';
import uuidv1 from 'uuid/v1'
import { BadRequestError, ServiceUnavailableError } from '../../errors';
import Responder from '../../lib/expressResponder';
import logger from '../../lib/logger'
import { argumentValidator } from '../../lib/utill';
const { Op } = Sequelize
const { user, transaction } = models;
let insertDB
const currencies = ['bitcoin', 'ethereum']
let balance, wallet, max, currency

const requestValidation = {
  properties: {
    currencyType: { type: 'string', enum: ['bitcoin', 'ethereum'] },
    currencyAmount: { type: 'number', min: 0 },
    targetWallet: { type: 'string' }
  },
  currencyValidator: [{ key: 'targetWallet' }],
  required: ['currencyType', 'currencyAmount', 'targetWallet']
}
export class PerformTransaction {
  static async perform(req, res) {
    return Responder.render(res, "makeTransaction", "Add transaction Data");
  }
  static async validateAndPerformTransaction(req, res) {
    //transaction object

    const requestData = await argumentValidator(res, requestValidation, req.body)
    if (!requestData.valid) return
    let transactionObj = requestData.response
    logger.info("validateAndPerformTransaction begin for transaction", transactionObj)
    transactionObj.transactionId = uuidv1()
    logger.info("Transaction Id", transactionObj.transactionId)
    //variable for key for generic for all currencies
    currency = transactionObj.currencyType
    balance = currency + 'Balance'
    wallet = currency + 'Wallet'
    max = 'max' + currency.charAt(0).toUpperCase() + currency.slice(1)

    //time when transaction begun
    transactionObj.createdAt = Date.now();
    logger.info("transaction begun at", transactionObj.createdAt)
    //validate transaction
    logger.info("Validating Transaction")
    const validateRes = await PerformTransaction.validateTransaction(req, transactionObj)
    //if not valid return error
    if (!validateRes.valid) return Responder.operationFailed(res, new BadRequestError(validateRes))
    //if valid then perform it 
    logger.info("Transaction Validated")
    logger.info("Performing Transaction")
    const response = await PerformTransaction.performTransaction(req, transactionObj, validateRes.sourceUser, validateRes.targetUser)
    logger.info("Transaction Response", response)
    Responder.created(res, response)

  }
  static async validateTransaction(req, transactionObj) {
    //retrieve source user account from DB
    let query = {}
    query["email"] = req.session.user.email
    logger.info("Fetching user for email id", query)
    let [sourceUser, sourceError] = await of(user.findOne({ where: query }))

    if (!(sourceUser !== null && sourceUser !== '')) {
      return { valid: false, message: 'user not found' }
    }
    sourceUser = sourceUser.dataValues

    //check if transaction amount is less than max
    if (sourceUser[max] < transactionObj.currencyAmount)
      return { valid: false, message: 'Transaction amount greater than limit' }
    //check account have sufficient balance 
    if (sourceUser[balance] < transactionObj.currencyAmount)
      return { valid: false, message: 'Insufficient Balance' }

    //retrieve target account 
    query = {}
    query[wallet] = transactionObj.targetWallet

    let [targetUser, err2] = await of(user.findOne({ where: query }))
    if (!(targetUser !== null && targetUser !== '')) {
      return { valid: false, message: 'user not found' }
    }
    targetUser = targetUser.dataValues
    //target and source should not be same
    if (targetUser.email === sourceUser.email) return { valid: false, message: 'Source and Target same' }
    //check for accepting max currency by target
    if (targetUser[max] < transactionObj.currencyAmount) {
      return { valid: false, message: 'Transaction amount greater than limit' }
    }
    //if all pass return valid signal
    return { valid: true, sourceUser, targetUser, message: 'Transaction valid' }
  }
  static async performTransaction(req, transactionObj, sourceUser, targetUser) {
    //update source user account 
    let sourceUpdate = {}
    sourceUpdate[balance] = sourceUser[balance] - transactionObj.currencyAmount
    let query = {}
    query[wallet] = sourceUser[wallet]
    query["email"] = req.session.user.email

    insertDB = await of(user.update(sourceUpdate, { where: query }))
    if (insertDB[1]) return { status: 500, error: insertDB[1] }

    //update target user account
    let targetUpdate = {}
    targetUpdate[balance] = targetUser[balance] - transactionObj.currencyAmount
    query = {}
    query[wallet] = targetUser[wallet]

    insertDB = await of(user.update(targetUpdate, { where: query }))
    if (insertDB[1]) return { status: 500, error: insertDB[1] }
    //add transaction to DB and then return response 

    //transaction object
    transactionObj.sourceUserId = sourceUser["email"]
    transactionObj.targetUserId = targetUser["email"]
    delete transactionObj.targetWallet
    return await PerformTransaction.insertTransaction(transactionObj)
  }
  static async insertTransaction(transactionObj) {
    //current time when transaction is processed
    transactionObj.processedAt = Date.now();
    transactionObj.state = 'success'
    insertDB = await of(transaction.create(transactionObj))
    if (insertDB[1]) {
      return { status: 500, error: insertDB[1] }
    }
    return { status: 201, Response: { transactionObj, message: 'transaction confirmed' } }
  }
}