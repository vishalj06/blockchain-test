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
    currencyType: { type: 'string', enum: ['bitcoin', 'ethereum'] }
  },
  required: ['currencyType']
}
export class TransactionHistory {
  static async perform(req, res) {
    return Responder.render(res, "transactionHistory")
}
  static async getTransactionHistory(req, res) {
    let requestData = await argumentValidator(res, requestValidation, req.body)
    if (!requestData.valid) return
    requestData = requestData.response
    let email = req.session.user.email
    let currencyType = requestData.currencyType
    const [userTx, TxFetchError] = await of(transaction.findAll({
      where: { currencyType, [Op.or]: [{ sourceUserId: email }, { targetUserId: email }] }
    }))
    let Sent = []
    let Received = []
    if (userTx == null) return Responder.success(res, { Transactions: { Sent: [], Received: [] } })

    for (let element of userTx) {
      element.sourceUserId == email ? Sent.push(element) : Received.push(element)
    };
    if (TxFetchError) Responder.operationFailed(res, new ServiceUnavailableError("DB Error"))
    return Responder.success(res, { Transactions: { Sent, Received } })
  }
}