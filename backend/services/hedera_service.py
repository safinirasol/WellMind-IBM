import hashlib
import os
import json
from dotenv import load_dotenv

# Hiero SDK imports - these should work now
from hiero_sdk_python import (
    Client,
    AccountId,
    PrivateKey,
    Network,
    TopicMessageSubmitTransaction,
    TopicId,
    FileCreateTransaction,
    ResponseCode
)

# Load environment variables
load_dotenv()

def store_hash_on_hedera(record):
    """
    Store a hashed burnout record on Hedera Testnet for audit trail.

    Args:
        record (dict): BurnoutResult data
    Returns:
        str: Hedera transaction or simulated ID
    """

    # Try different environment variable names for compatibility
    hedera_account_id = (
        os.getenv('HEDERA_ACCOUNT_ID') or 
        os.getenv('OPERATOR_ID')
    )
    hedera_private_key = (
        os.getenv('HEDERA_PRIVATE_KEY') or 
        os.getenv('OPERATOR_KEY')
    )
    hedera_topic_id = os.getenv('HEDERA_TOPIC_ID')

    # Validate environment variables
    if not hedera_account_id or not hedera_private_key:
        print("Hedera credentials not configured, simulating transaction")
        return _simulate_hedera_tx(record)

    try:
        # Initialize client
        network_name = os.getenv('NETWORK', 'testnet').lower()
        network = Network(network_name)
        client = Client(network)
        
        print(f"🔗 Connecting to Hedera {network_name} network")

        # Set operator
        operator_id = AccountId.from_string(hedera_account_id)
        operator_key = PrivateKey.from_string(hedera_private_key)
        client.set_operator(operator_id, operator_key)
        
        print(f"👤 Client set up with operator: {client.operator_account_id}")

        # Hash record for audit trail
        record_str = json.dumps(record, sort_keys=True)
        record_hash = hashlib.sha256(record_str.encode()).hexdigest()

        payload = {
            "event": "burnout_score",
            "record_id": record.get("id"),
            "risk_label": record.get("label"),
            "risk_score": record.get("risk_score"),
            "hash": record_hash,
            "ts": record.get("watson_timestamp"),
            "employee_id": record.get("employee_id")
        }
        message = json.dumps(payload)

        # If Topic ID exists, publish to topic (HCS)
        if hedera_topic_id:
            topic_id = TopicId.from_string(hedera_topic_id.strip())
            
            print(f"📝 Submitting message to topic: {topic_id}")
            
            # Create and execute transaction
            transaction = (
                TopicMessageSubmitTransaction(topic_id=topic_id, message=message)
                .freeze_with(client)
                .sign(operator_key)
            )

            receipt = transaction.execute(client)
            tx_id = receipt.transaction_id
            
            print(f"✅ Success! Message submitted to topic {topic_id}")
            print(f"📄 Transaction ID: {tx_id}")
            print(f"📊 Transaction status: {ResponseCode(receipt.status).name}")
            
            return f"topic:{topic_id}:{tx_id}"

        # Fallback: FileCreateTransaction (if no topic ID)
        print("📁 No topic ID configured, creating file instead...")
        
        transaction = (
            FileCreateTransaction(contents=record_hash.encode())
            .freeze_with(client)
            .sign(operator_key)
        )
        
        receipt = transaction.execute(client)
        file_id = receipt.file_id
        
        print(f"✅ Success! File created: {file_id}")
        return f"file:{file_id}"

    except Exception as e:
        print(f"❌ Hedera error: {str(e)}")
        import traceback
        traceback.print_exc()
        return _simulate_hedera_tx(record)


def _simulate_hedera_tx(record):
    """Simulation fallback for dev/testing"""
    record_str = json.dumps(record, sort_keys=True)
    record_hash = hashlib.sha256(record_str.encode()).hexdigest()
    return f"simulate-{record.get('id', 9999)}-{record_hash[:10]}"