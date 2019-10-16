import bcrypt from 'bcrypt'
export default (sequelize, DataTypes) => {

  const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    bitcoinWallet: { type: DataTypes.STRING, field: 'bitcoin_wallet', unique: true },
    bitcoinBalance: { type: DataTypes.DECIMAL(10, 6), field: 'bitcoin_alance' },
    maxBitcoin: { type: DataTypes.DECIMAL(10, 6), field: 'max_bitcoin' },
    ethereumWallet: { type: DataTypes.STRING, field: 'ethereum_wallet', unique: true },
    ethereumBalance: { type: DataTypes.DECIMAL(10, 6), field: 'ethereum_balance' },
    maxEthereum: { type: DataTypes.DECIMAL(10, 6), field: 'max_ethereum' }
  }, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
    instanceMethods: {
      validPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
      }
    }
  });


  return User;
};
