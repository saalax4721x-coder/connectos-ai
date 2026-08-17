# Workflow Retry Policy

Retries are bounded and step-specific. Retryable failures require idempotency or compensation semantics. Permission failures and validation failures are not blindly retried.