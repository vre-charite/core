const devServerUrl = 'http://10.3.7.220/vre';
const devServerBaseUrl = 'http://10.3.7.220/vre/api/vre/portal';
const stagingUrl = 'https://nx.indocresearch.org/vre';
const stagingServerUrl = 'https://nx.indocresearch.org/vre/portal';

const baseUrl = devServerUrl&&'http://localhost:3001';
const serverUrl = devServerBaseUrl;
const testFileBasePath = 'C:\\Users\\combo\\Desktop\\upload-test';

module.exports = {
  baseUrl,
  testFileBasePath,
  stagingUrl,
  stagingServerUrl,
  serverUrl,
};
