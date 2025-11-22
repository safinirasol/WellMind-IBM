const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { Client, TopicMessageSubmitTransaction } = require('@hashgraph/sdk');

(async () => {
  try {
    const accountId = (process.env.HEDERA_ACCOUNT_ID || '').trim();
    let privateKey = (process.env.HEDERA_PRIVATE_KEY || '').trim();
    const topicId = (process.env.HEDERA_TOPIC_ID || '').trim();

    if (!accountId || !privateKey || !topicId) {
      console.error('Missing HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY or HEDERA_TOPIC_ID in .env');
      process.exit(1);
    }

    const tryKeys = [
      privateKey,
      privateKey.replace(/^0x/i, ''),
      privateKey.replace(/^0x/i, '').trim()
    ];

    let lastError = null;
    for (const keyVariant of tryKeys) {
      try {
        const client = Client.forTestnet();
        client.setOperator(accountId, keyVariant);
        console.log('Using key variant:', keyVariant.length > 12 ? `${keyVariant.slice(0,8)}...${keyVariant.slice(-8)}` : keyVariant);

        const message = JSON.stringify({ event: 'test_submit', ts: new Date().toISOString(), note: 'test message from local script' });
        const tx = await new TopicMessageSubmitTransaction()
          .setTopicId(topicId)
          .setMessage(message)
          .execute(client);

        const receipt = await tx.getReceipt(client);
        console.log('Submission receipt:', receipt);
        console.log('Success — topic message submitted. Check mirror node for messages.');
        return;
      } catch (e) {
        lastError = e;
        console.error('Attempt failed for this key variant:', e && e.toString ? e.toString() : e);
      }
    }

    console.error('All key variants failed. Last error:', lastError);
  } catch (err) {
    console.error('Unexpected error:', err);
    if (err.stack) console.error(err.stack);
  }
})();
