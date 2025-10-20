import { SystemKeychain } from '@envguard/core';

const keychain = new SystemKeychain('com.amannirala.example.keychain');

// setting apiKey
keychain
  .set('apiKey', '12345-ABCDE')
  .then(() => {
    console.log('Key set successfully.');

    // retrieving the key
    keychain
      .get('apiKey')
      .then((value) => {
        console.log('Retrieved value:', value);
      })
      .catch((err) => {
        console.error('Error retrieving value:', err);
      });

    // deleting the key
    keychain
      .delete('apiKey')
      .then((_) => {
        console.log('Key deleted successfully.');
      })
      .catch((err) => {
        console.error('Error deleting key:', err);
      });

    // testing retrieval after deletion
    keychain
      .get('apiKey')
      .then((value) => {
        console.log('Retrieved value after deletion (should be null):', value);
      })
      .catch((err) => {
        console.error('Error retrieving value after deletion:', err);
      });
  })
  .catch((err) => {
    console.error('Error setting key:', err);
  });
