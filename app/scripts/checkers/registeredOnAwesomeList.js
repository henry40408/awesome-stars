import includes from 'lodash/includes';
import { Client } from 'chomex';

module.exports = async ({ owner, name }) => {
  const messageClient = new Client(chrome.runtime);
  const { data: awesomeList } = await messageClient.message('/awesome-list/get');
  return includes(awesomeList, `${owner}/${name}`);
};
