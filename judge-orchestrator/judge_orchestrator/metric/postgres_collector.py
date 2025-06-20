import psycopg2

from judge_orchestrator.config import (
    DB_URL,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
)
from .collector import Collector
from .metrics import (
    POSTGRES_ACTIVE_CONNECTIONS,
    POSTGRES_IDLE_CONNECTIONS,
    POSTGRES_IDLE_IN_TRANSACTION_CONNECTIONS,
    POSTGRES_TRANSACTION_COMMIT_COUNT,
    POSTGRES_TRANSACTION_ROLL_BACK_COUNT,
    POSTGRES_TABLE_SIZE,
    POSTGRES_TABLE_SEQ_SCAN_COUNT,
    POSTGRES_TABLE_INDEX_SCAN_COUNT,
)


class PostgresCollector(Collector):
    def __init__(self):
        super().__init__()
        self.pg_client = psycopg2.connect(
            DB_URL.replace("postgresql://",
                           f"postgresql://{DB_USER}:{DB_PASSWORD}@")
        )

    def _collect(self):
        cursor = self.pg_client.cursor()

        cursor.execute(
            f"SELECT state, COUNT(*) AS connection_count FROM pg_stat_activity GROUP BY datname, state HAVING datname = '{DB_NAME}';")
        connection_states = cursor.fetchall()
        POSTGRES_ACTIVE_CONNECTIONS.set(0)
        POSTGRES_IDLE_CONNECTIONS.set(0)
        POSTGRES_IDLE_IN_TRANSACTION_CONNECTIONS.set(0)
        for state, count in connection_states:
            if state == 'active':
                POSTGRES_ACTIVE_CONNECTIONS.set(count)
            elif state == 'idle':
                POSTGRES_IDLE_CONNECTIONS.set(count)
            elif state == 'idle in transaction':
                POSTGRES_IDLE_IN_TRANSACTION_CONNECTIONS.set(count)

        cursor.execute(
            f"SELECT xact_commit, xact_rollback FROM pg_stat_database WHERE datname = '{DB_NAME}';")
        db_xact_stats = cursor.fetchall()
        for row in db_xact_stats:
            xact_commit, xact_rollback = row
            POSTGRES_TRANSACTION_COMMIT_COUNT._value = xact_commit
            POSTGRES_TRANSACTION_ROLL_BACK_COUNT._value = xact_rollback

        cursor.execute("""
            SELECT
                c.relname AS table_name,
                pg_total_relation_size(c.oid) AS total_table_size_bytes,
                s.seq_scan,
                s.idx_scan
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            JOIN pg_stat_user_tables s ON s.relid = c.oid
            WHERE c.relkind = 'r'
                AND n.nspname NOT IN ('pg_catalog', 'information_schema')
        """)
        table_stats = cursor.fetchall()

        for row in table_stats:
            table_name, total_table_size, seq_scan, idx_scan = row
            POSTGRES_TABLE_SIZE.labels(
                table_name=table_name).set(total_table_size)
            POSTGRES_TABLE_SEQ_SCAN_COUNT.labels(
                table_name=table_name)._value = seq_scan
            POSTGRES_TABLE_INDEX_SCAN_COUNT.labels(
                table_name=table_name)._value = idx_scan
