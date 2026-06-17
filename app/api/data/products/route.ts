import { NextResponse } from "next/server";
import { runQuery } from "../../datarbicksConnection";
import { tables } from "../../datarbicksConnection/config";

export async function POST(request: Request) {
  const { productIDList } = await request.json();
  const startTime = performance.now();

  if (
    !productIDList ||
    !Array.isArray(productIDList) ||
    productIDList.length === 0
  ) {
    return NextResponse.json(
      { error: "Missing or invalid productIDList in request body" },
      { status: 400 },
    );
  }

  const deltaQuery = /*sql*/ `
    SELECT * FROM ${tables.products}

    WHERE produkt_id IN (${productIDList.join(",")})

    `;

  const res = await runQuery(deltaQuery);

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
