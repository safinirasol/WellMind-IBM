// lib/hedera.ts
import {
  Client,
  PrivateKey,
  TopicMessageSubmitTransaction
} from '@hashgraph/sdk'

export async function logToHedera(message: string) {
  const accountId = process.env.HEDERA_ACCOUNT_ID
  const privateKey = process.env.HEDERA_PRIVATE_KEY
  const topicId = process.env.HEDERA_TOPIC_ID

  if (!accountId || !privateKey || !topicId) {
    console.error("❌ Missing Hedera environment variables")
    return
  }

  try {
    // Connect to Hedera Testnet
    const client = Client.forTestnet()
    client.setOperator(accountId, PrivateKey.fromString(privateKey))

    const tx = await new TopicMessageSubmitTransaction({
      topicId,
      message
    }).execute(client)

    const receipt = await tx.getReceipt(client)

    console.log("✅ Hedera message logged:", receipt.status.toString())
    return receipt
  } catch (error) {
    console.error("❌ Hedera logging failed:", error)
    return null
  }
}
