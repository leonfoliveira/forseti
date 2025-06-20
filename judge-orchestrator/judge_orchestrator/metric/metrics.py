from prometheus_client import Counter, Gauge

DOCKER_UP = Gauge(
    'docker_container_up', 'Status of the container', ['container_name'])
DOCKER_CPU_USAGE = Gauge(
    'docker_cpu_usage', 'CPU usage of the container', ['container_name'])
DOCKER_MEMORY_USAGE = Gauge(
    'docker_memory_usage', 'Memory usage of the container', ['container_name'])

SQS_MESSAGES_AVAILABLE = Gauge(
    'sqs_messages_available', 'Number of messages available in the queue', ['queue_name'])
SQS_MESSAGES_IN_FLIGHT = Gauge(
    'sqs_messages_in_flight', 'Number of messages in flight in the queue', ['queue_name'])
SQS_OLDEST_MESSAGE_AGE = Gauge(
    'sqs_oldest_message_age', 'Age of the oldest message in the queue', ['queue_name'])

S3_OBJECT_COUNT = Gauge(
    's3_object_count', 'Number of objects in the S3 bucket', ['bucket_name'])
S3_TOTAL_SIZE = Gauge(
    's3_total_size', 'Total size of objects in the S3 bucket', ['bucket_name'])

POSTGRES_ACTIVE_CONNECTIONS = Gauge(
    'postgres_active_connections', 'Number of active connections to the Postgres database')
POSTGRES_IDLE_CONNECTIONS = Gauge(
    'postgres_idle_connections', 'Number of idle connections to the Postgres database')
POSTGRES_IDLE_IN_TRANSACTION_CONNECTIONS = Gauge(
    'postgres_idle_in_transaction_connections', 'Number of idle connections in transaction to the Postgres database')
POSTGRES_TABLE_SIZE = Gauge(
    'postgres_table_size', 'Size of the Postgres table', ['table_name'])
POSTGRES_TRANSACTION_COMMIT_COUNT = Counter(
    'postgres_transaction_commit_count', 'Number of transactions committed in the Postgres database')
POSTGRES_TRANSACTION_ROLL_BACK_COUNT = Counter(
    'postgres_transaction_roll_back_count', 'Number of transactions rolled back in the Postgres database')
POSTGRES_TABLE_SEQ_SCAN_COUNT = Counter(
    'postgres_table_seq_scan_count', 'Number of sequential scans on the Postgres table', ['table_name'])
POSTGRES_TABLE_INDEX_SCAN_COUNT = Counter(
    'postgres_table_index_scan_count', 'Number of index scans on the Postgres table', ['table_name'])
