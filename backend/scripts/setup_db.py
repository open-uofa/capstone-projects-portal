#!/usr/bin/env python
import argparse
import sys
from pathlib import Path

import psycopg
from environ import Env
from psycopg import sql


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Set up the database for the portal.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop the database and user if they already exist, then recreate them.",
    )
    args = parser.parse_args()

    # Read env from backend/.env
    env = Env(DEBUG=(bool, False))
    BASE_DIR = Path(__file__).resolve().parent.parent
    env.read_env(env_file=BASE_DIR / ".env")

    # Read the host address and port from .env
    # If none is specified, localhost:5432 is used
    HOST = env("PORTAL_DB_HOST", default="localhost")
    PORT = env("PORTAL_DB_PORT", default="5432")

    # Read name of database, user, and password to connect to the PostgreSQL server with
    PG_CONNECT_DB_NAME = env("PG_CONNECT_DATABASE", default="postgres")
    PG_CONNECT_USER = env("PG_CONNECT_USER", default="postgres")
    PG_CONNECT_PASSWORD = env("PG_CONNECT_PASSWORD", default="postgres")

    # Read name of database, user, and password to create from .env
    DB_NAME = env("PORTAL_DB_DATABASE", default="portal")
    USER = env("PORTAL_DB_USER", default="portal")
    PASSWORD = env("PORTAL_DB_PASSWORD", default="portal")

    print(
        f'Connecting to Postgres server {HOST}:{PORT} with database "{PG_CONNECT_DB_NAME}" and user "{PG_CONNECT_USER}"'
    )
    print(f'Will create database "{DB_NAME}" and user "{USER}"')

    # Connect to database named 'postgres'
    conn = psycopg.connect(
        dbname=PG_CONNECT_DB_NAME,
        host=HOST,
        port=PORT,
        user=PG_CONNECT_USER,
        password=PG_CONNECT_PASSWORD,
    )
    conn.autocommit = True
    cursor = conn.cursor()

    # Check if database already exists
    cursor.execute(
        """
    SELECT 1 FROM pg_catalog.pg_database WHERE datname=%s;
    """,
        (DB_NAME,),
    )
    database_already_exists = cursor.fetchone() is not None

    if database_already_exists and not args.reset:
        print(
            f'Database "{DB_NAME}" already exists. Run with --reset to drop and recreate it'
        )
    else:
        if database_already_exists:
            response = input(
                f'Database "{DB_NAME}" already exists. Delete all data? [y/N] '
            )
            if response.lower() != "y":
                print("Aborting")
                sys.exit(1)
                return

            # Drop the database
            cursor.execute(
                sql.SQL(
                    """
            DROP DATABASE {db_name};
            """
                ).format(db_name=sql.Identifier(DB_NAME))
            )
            print(f'Successfully dropped database "{DB_NAME}"')

        # Create the database
        # This has to be separated from the rest of the statements,
        # otherwise the query gets run in a transaction, and we
        # can't create a database inside a transaction.
        cursor.execute(
            sql.SQL(
                """
        CREATE DATABASE {db_name};
        """
            ).format(db_name=sql.Identifier(DB_NAME))
        )
        print(f'Successfully created database "{DB_NAME}"')

    # Check if user already exists
    cursor.execute(
        """
    SELECT 1 FROM pg_roles WHERE rolname=%s;
    """,
        (USER,),
    )
    user_already_exists = cursor.fetchone() is not None

    if user_already_exists and not args.reset:
        print(f'User "{USER}" already exists. Run with --reset to drop and recreate it')
    else:
        if user_already_exists:
            # Drop the user
            cursor.execute(
                sql.SQL(
                    """
            REASSIGN OWNED BY {user} TO {pg_connect_user};
            DROP OWNED BY {user};
            DROP USER {user};
            """
                ).format(
                    pg_connect_user=sql.Identifier(PG_CONNECT_USER),
                    user=sql.Identifier(USER),
                )
            )
            print(f'Successfully dropped user "{USER}"')

        # Create user, set password, configuration for Django, and grant privileges
        # User will have all privileges on the created database
        # They will also be allowed to create databases, as this is needed for testing
        # https://docs.djangoproject.com/en/3.2/ref/databases/#optimizing-postgresql-s-configuration
        cursor.execute(
            sql.SQL(
                """
        CREATE USER {user};
        ALTER USER {user} WITH ENCRYPTED PASSWORD {password};
        ALTER USER {user} SET client_encoding='UTF-8';
        ALTER USER {user} SET default_transaction_isolation='read committed';
        ALTER USER {user} SET timezone='UTC';
        ALTER USER {user} createdb;
        GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {user};
        """
            ).format(
                db_name=sql.Identifier(DB_NAME),
                user=sql.Identifier(USER),
                password=sql.Literal(PASSWORD),
            )
        )
        print(f'Successfully created user "{USER}"')

    cursor.close()
    conn.close()

    # On PostgreSQL 15 and later,
    # the user must have the CREATE privilege on the public schema
    conn = psycopg.connect(
        dbname=DB_NAME,
        host=HOST,
        port=PORT,
        user=PG_CONNECT_USER,
        password=PG_CONNECT_PASSWORD,
    )
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute(
        sql.SQL(
            """
            GRANT CREATE ON SCHEMA public TO {user};
            """
        ).format(user=sql.Identifier(USER))
    )
    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()
