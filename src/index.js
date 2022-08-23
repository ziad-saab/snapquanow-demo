const ensureSnapquanowIsInstalled = async () => {
  await wallet.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: {
          'npm:snapquanow': {},
        },
      },
    ],
  });
};

const callSnapquanow = async (method, params) => {
  await ensureSnapquanowIsInstalled();
  return wallet.request({
    method: 'wallet_invokeSnap',
    params: [
      'npm:snapquanow',
      {
        method,
        params,
      },
    ],
  });
};

module.exports.onRpcRequest = async ({ request }) => {
  switch (request.method) {
    case 'getEthereumPrice':
      return callSnapquanow('getTokenPrice', {
        token: 'ETH',
        fiat: 'USD',
      });

    case 'monitorEthereumPrice': {
      await callSnapquanow('streamTokenPrice', {
        token: 'ETH',
        fiat: 'USD',
        callback: {
          snapId: 'local:http://localhost:8888/',
          method: 'receiveEthereumPrice',
        },
      });

      return true;
    }
    case 'receiveEthereumPrice':
      console.log('Received ETH price', request.params);
      return Math.random() > 0.1; // 10% chance of stopping the price stream
    default:
      throw new Error('Method not found.');
  }
};
