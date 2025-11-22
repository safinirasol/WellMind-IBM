const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { Client, AccountInfoQuery, PrivateKey } = require('@hashgraph/sdk');

(async () => {
  try {
    const accountId = (process.env.HEDERA_ACCOUNT_ID || '').trim();
    let privateKey = (process.env.HEDERA_PRIVATE_KEY || '').trim();

    if (!accountId) {
      console.error('Missing HEDERA_ACCOUNT_ID in .env');
      process.exit(1);
    }

    const client = Client.forTestnet();

    console.log('Querying account info for', accountId);
    try {
      const info = await new AccountInfoQuery().setAccountId(accountId).execute(client);
      console.log('Account info retrieved. Key (raw):', info.key ? JSON.stringify(info.key) : info);
      try {
        console.log('Account key (toString):', info.key.toString());
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error('Failed to fetch account info:', e.toString());
    }

    if (!privateKey) {
      console.error('No HEDERA_PRIVATE_KEY in .env; cannot derive public key');
      process.exit(1);
    }

    const variants = [
      privateKey,
      privateKey.replace(/^0x/i, ''),
      privateKey.replace(/^0x/i, '').trim()
    ];

    for (const v of variants) {
      try {
        let pk = null;
        try {
          pk = PrivateKey.fromString(v);
        } catch (e) {
          try {
            pk = PrivateKey.fromStringED25519(v);
          } catch (e2) {
            try {
              pk = PrivateKey.fromStringECDSA(v);
            } catch (e3) {
              // give up for this variant
              throw new Error('PrivateKey.parse failed for variant');
            }
          }
        }

        console.log('\nVariant OK. Derived public key (toString):', pk.publicKey.toString());
        console.log('Derived public key (bytes hex):', Buffer.from(pk.publicKey.toBytes()).toString('hex'));
      } catch (err) {
        console.error('\nVariant parse failed for:', v.length > 12 ? `${v.slice(0,8)}...${v.slice(-8)}` : v);
        console.error(err.toString());
      }
    }

    console.log('\nDone. Compare the account key above with the derived public keys to see if they match.');
  } catch (err) {
    console.error('Unexpected error:', err);
    if (err.stack) console.error(err.stack);
  }
})();
