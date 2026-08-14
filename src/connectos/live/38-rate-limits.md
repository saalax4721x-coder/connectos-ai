# Provider rate limits
Each provider adapter must enforce quotas, exponential backoff, request deduplication, and bounded retries so one source cannot destabilize ConnectOS.