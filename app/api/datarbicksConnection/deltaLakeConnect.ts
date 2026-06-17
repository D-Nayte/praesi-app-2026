import { DBSQLClient } from "@databricks/sql";
import IDBSQLClient from "@databricks/sql/dist/contracts/IDBSQLClient";
import IDBSQLSession from "@databricks/sql/dist/contracts/IDBSQLSession";

const token = process.env.DB_TOKEN!;
const server_hostname = process.env.DB_HOST_NAME!;
const http_path = process.env.DB_HTTP_PATH!;

const client = new DBSQLClient();

async function executeAndClose(session: IDBSQLSession, sql: string) {
  const operation = await session.executeStatement(sql, {
    runAsync: true,
  });

  await operation.close();
}

export const runQuery = async (query: string) => {
  let connection: IDBSQLClient | undefined;
  let session: IDBSQLSession | undefined;
  let queryOperation;

  try {
    connection = await client.connect({
      token: token,
      host: server_hostname,
      path: http_path,
    });

    session = await connection.openSession();

    // Cache für diese Databricks-Session ausschalten
    await executeAndClose(session, "SET use_cached_result = false");

    // // Optional, aber empfohlen: richtigen Catalog und Schema setzen
    // await executeAndClose(session, "USE CATALOG test_catalog");
    // await executeAndClose(session, "USE SCHEMA demo_andy_shop");

    queryOperation = await session.executeStatement(query, {
      runAsync: true,
    });

    const result = await queryOperation.fetchAll();

    return result;
  } catch (error) {
    console.error("Error running query:", error);
    return [];
  } finally {
    if (queryOperation) await queryOperation.close();
    if (session) await session.close();
    if (connection) await connection.close();
  }
};
