import registeredOnAwesomeListAsync from './registeredOnAwesomeList';

module.exports = async (options) => {
  const isOnAwesomeList = await registeredOnAwesomeListAsync(options);
  return isOnAwesomeList;
};
