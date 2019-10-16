export default (sequelize, DataTypes) => {
    const Transaction = sequelize.define('transaction', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      currencyType: { type: DataTypes.ENUM('bitcoin', 'ethereum'), field: 'currency_type' },
      currencyAmount: { type: DataTypes.DECIMAL(10, 6), field: 'currency_amount' },
      sourceUserId: { type: DataTypes.STRING, field: 'source_user_id' },
      targetUserId: { type: DataTypes.STRING, field: 'target_user_id' },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      processedAt: { type: DataTypes.DATE, field: 'processed_at' },
      state: DataTypes.ENUM('success', 'fail')
  
    }, {});
    return Transaction;
  };