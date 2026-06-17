"use client";

import DataLayout from "@/components/DataLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRightLeft, Database, TimerReset } from "lucide-react";

export type LakebaseUser = {
  user_id: number;
  name: string;
};

export type DeltaUsers = {
  user_id: number;
  vorname: string;
  nachname: string;
  email: string;
  stadt: string;
  erstellt_am: string;
};

export type ExecutionTime = {
  executionTimeSeconds: number;
  executionTimeMilliseconds: number;
};

export type GetUsersResponse<T extends boolean> = T extends true
  ?
      | ({
          data: LakebaseUser[];
        } & ExecutionTime)
      | undefined
  :
      | ({
          data: DeltaUsers[];
        } & ExecutionTime)
      | undefined;

export type GetUsers = <T extends boolean>(
  useLakeBase: T,
) => Promise<GetUsersResponse<T>>;

export type DeltaOrder = {
  bestellung_id: number;
  user_id: number;
  product_ids: number[];
  bestell_datum: string;
  status: string;
};

export type LakebaseOrder = {
  bestellung_id: number;
  user_id: number;
  product_ids: number[];
  status: string;
};

export type GetOrdersResponse<T extends boolean> = T extends true
  ?
      | ({
          data: LakebaseOrder[]; // Hier kannst du den spezifischen Typ für Lakebase-Orders angeben
        } & ExecutionTime)
      | undefined
  :
      | ({
          data: DeltaOrder[]; // Hier kannst du den spezifischen Typ für Delta Lake-Orders angeben
        } & ExecutionTime)
      | undefined;

export type GetOrders = <T extends boolean>(
  userID: number,
  useLakeBase: T,
) => Promise<GetOrdersResponse<T>>;

export default function Home() {
  const getUsers: GetUsers = async (useLakeBase) => {
    try {
      const res = await fetch("/api/data/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ useLakeBase }),
      });
      const data = await res.json();
      console.log("Users:", data);
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return;
    }
  };

  const getOrders: GetOrders = async (userID, useLakeBase) => {
    try {
      const res = await fetch("/api/data/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID, useLakeBase }),
      });
      const data = await res.json();
      console.log("Orders:", data);
      return data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return;
    }
  };

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      {/* <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-16 h-48 w-48 rounded-full bg-[color-mix(in_oklch,var(--chart-3)_35%,white)] blur-3xl" />
        <div className="absolute bottom-24 right-[10%] h-64 w-64 rounded-full bg-[color-mix(in_oklch,var(--chart-1)_30%,white)] blur-3xl" />
      </div> */}

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4">
        <section className="grid flex-1 items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <DataLayout
            useLakeBase={false}
            getUsers={getUsers}
            getOrders={getOrders}
            label="Delta Lake"
          />

          <div className="hidden xl:flex xl:justify-center">
            <Separator
              orientation="vertical"
              className="h-full bg-slate-300/70"
            />
          </div>
          <div className="xl:hidden">
            <Separator className="bg-slate-300/70" />
          </div>

          <DataLayout
            useLakeBase={true}
            getUsers={getUsers}
            getOrders={getOrders}
            label="Lakebase"
          />
        </section>
      </main>
    </div>
  );
}
