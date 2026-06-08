# -*- coding: utf-8 -*-
"""Run a .sql file against the Supabase Postgres DB.
Connection params come from environment variables (never hardcoded).
Usage:  python scripts/run_sql.py <path-to-sql>
"""
import os, sys, psycopg2

def main():
    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read()
    conn = psycopg2.connect(
        host=os.environ["PGHOST"],
        port=os.environ.get("PGPORT", "5432"),
        user=os.environ["PGUSER"],
        password=os.environ["PGPASSWORD"],
        dbname=os.environ.get("PGDATABASE", "postgres"),
        sslmode="require",
        connect_timeout=30,
    )
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute(sql)  # no params -> simple protocol -> multi-statement OK
    conn.close()
    print(f"OK: executed {path}")

if __name__ == "__main__":
    main()
