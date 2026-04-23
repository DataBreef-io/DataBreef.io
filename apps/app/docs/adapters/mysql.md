# MySQL / MariaDB Adapter

DataBreef connects to MySQL (5.7.4+) and MariaDB (10.3+) using a read-only connection. The adapter enforces read-only transactions at the session level before querying the `information_schema`.

## Connection String Format

```
mysql://username:password@host:port/database
```

**Examples**

```
mysql://readonly_user:s3cur3pass@db.example.com:3306/production
mysql://reader:pass@127.0.0.1:3306/myapp
mysql://breef:pass@mysql.internal:3306/analytics
```

## Recommended Role Setup

Create a dedicated read-only MySQL account for DataBreef. Never use a root or admin account.

```sql
-- 1. Create the role / user
CREATE USER 'databreef'@'%' IDENTIFIED BY '<strong-password>';

-- 2. Grant read-only access to your target database(s)
GRANT SELECT ON production.* TO 'databreef'@'%';

-- 3. Deny any writes (belt-and-suspenders)
REVOKE INSERT, UPDATE, DELETE, DROP, CREATE, ALTER ON *.* FROM 'databreef'@'%';

FLUSH PRIVILEGES;
```

For introspection of multiple databases on the same server, grant SELECT on each:

```sql
GRANT SELECT ON analytics.* TO 'databreef'@'%';
GRANT SELECT ON reporting.* TO 'databreef'@'%';
```

## Read-Only Enforcement

DataBreef enforces two layers of read-only protection on every connection:

| Step | SQL | Purpose |
|------|-----|---------|
| 1 | `SET SESSION MAX_EXECUTION_TIME = 30000` | Kills any query exceeding 30 s |
| 2 | `START TRANSACTION READ ONLY` | MySQL rejects all write operations |

After introspection completes, the engine issues `COMMIT` to cleanly close the transaction.

### Verification

You can verify the read-only status from inside a `READ ONLY` transaction:

```sql
START TRANSACTION READ ONLY;
SELECT @@transaction_read_only;
-- Expected result: 1
```

Attempting any write will fail:

```sql
START TRANSACTION READ ONLY;
INSERT INTO test_table (col) VALUES ('x');
-- ERROR 1792 (25006): Cannot execute statement in a READ ONLY transaction.
```

## TLS

The adapter enables TLS by default (`ssl: { rejectUnauthorized: false }`), which encrypts traffic while accepting self-signed certificates. This covers most cloud-hosted MySQL instances (AWS RDS, PlanetScale, Aiven, etc.).

For strict certificate verification (e.g., custom CA), contact your DataBreef administrator to configure `rejectUnauthorized: true` with the CA bundle.

## Information Schema Queries

DataBreef reads the following `information_schema` views — no application tables are touched:

| View | Purpose |
|------|---------|
| `TABLES` | Table names, row estimates, sizes |
| `COLUMNS` | Column names, data types, nullability |
| `KEY_COLUMN_USAGE` | Foreign key relationships |
| `TABLE_CONSTRAINTS` | Primary key detection |
| `STATISTICS` | Index counts per table |
| `SCHEMATA` | Available database/schema names |

System schemas are always excluded: `information_schema`, `mysql`, `performance_schema`, `sys`.

## Troubleshooting

### Connection refused

- Confirm the host and port (default: `3306`).
- Check that the MySQL server allows remote connections (`bind-address` in `my.cnf`).
- Verify firewall / security group rules allow inbound traffic on port 3306.

### Access denied

```
ERROR 1045 (28000): Access denied for user 'databreef'@'...'
```

- Check the username and password are URL-encoded if they contain special characters.
- Verify the user has `SELECT` privilege on the target database.

### SSL connection error

```
Error: SSL connection error: ...
```

- Ensure the MySQL server has `require_secure_transport = ON` (or your server accepts SSL).
- Some older MySQL 5.7 installations need `ssl-mode=PREFERRED` on the server.

### MAX_EXECUTION_TIME not supported

DataBreef silently skips `SET SESSION MAX_EXECUTION_TIME` on MySQL < 5.7.4. The `START TRANSACTION READ ONLY` protection still applies.

## MariaDB Notes

MariaDB supports `START TRANSACTION READ ONLY` from version 10.0+. The `MAX_EXECUTION_TIME` session variable is not available in MariaDB; DataBreef skips it automatically and relies on `READ ONLY` transaction enforcement.
