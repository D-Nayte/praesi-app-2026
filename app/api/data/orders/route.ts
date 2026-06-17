import { NextResponse } from "next/server";
import { runLbQuery, runQuery } from "../../datarbicksConnection";
import { tables, lakebaseTables } from "../../datarbicksConnection/config";

export async function POST(request: Request) {
  const { userID, useLakeBase } = await request.json();

  if (!userID) {
    return NextResponse.json(
      { error: "Missing userID in request body" },
      { status: 400 },
    );
  }
  const startTime = performance.now();

  const deltaQuery = /*sql*/ `
    SELECT * FROM ${tables.orders}
    WHERE user_id = ${userID}
    `;

  const lakebaseQuery = /*sql*/ `
    SELECT * FROM ${lakebaseTables.orders}
    WHERE user_id = ${userID}
    `;

  const res = useLakeBase
    ? await runLbQuery(lakebaseQuery)
    : await runQuery(deltaQuery);

  const endTime = performance.now();

  if (!res || !res?.length) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  const data = {
    data: res,
    executionTimeSeconds: ((endTime - startTime) / 1000).toFixed(2),
    executionTimeMilliseconds: (endTime - startTime).toFixed(2),
  };

  return NextResponse.json(data);
}
