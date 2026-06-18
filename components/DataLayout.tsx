import type {
  DeltaUsers,
  LakebaseUser,
  GetUsers,
  ExecutionTime,
  GetOrders,
  LakebaseOrder,
  DeltaOrder,
} from "@/app/page";
import { useState, useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Clock3, Package, ShoppingCart, Users } from "lucide-react";

type Props = {
  getUsers: GetUsers;
  label: string;
  useLakeBase: boolean;
  getOrders: GetOrders;
};

type ProductDetails = {
  produkt_id: number;
  produkt_name: string;
  kategorie: string;
  preis: number;
  lagerbestand: number;
};

type ProductDetailsResponse = {
  data: ProductDetails[];
  executionTimeSeconds: number;
  executionTimeMilliseconds: number;
};

const DataLayout = ({ getUsers, label, useLakeBase, getOrders }: Props) => {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [users, setUsers] = useState<DeltaUsers[] | LakebaseUser[] | undefined>(
    undefined,
  );
  const [userExecTime, setUserExecTime] = useState<ExecutionTime | undefined>(
    undefined,
  );
  const [ordersExecTime, setOrdersExecTime] = useState<
    ExecutionTime | undefined
  >(undefined);
  const [productsExecTime, setProductsExecTime] = useState<
    ExecutionTime | undefined
  >(undefined);
  const [loadingUsers, setloadingUsers] = useState(true);
  const [userOrders, setuserOrders] = useState<
    DeltaOrder[] | LakebaseOrder[] | undefined
  >(undefined);
  const [ordersLoading, setOrdersLoading] = useState(false);
  //   const [produktIDList, setproduktIDList] = useState<number[] | undefined>(undefined);
  const [productDetails, setproductDetails] = useState<
    ProductDetails[] | undefined
  >(undefined);

  const [productLoading, setProductLoading] = useState(false);

  const totalExecTime = {
    executionTimeSeconds:
      Number(userExecTime?.executionTimeSeconds || 0) +
      Number(ordersExecTime?.executionTimeSeconds || 0) +
      Number(productsExecTime?.executionTimeSeconds || 0),
    executionTimeMilliseconds:
      Number(userExecTime?.executionTimeMilliseconds || 0) +
      Number(ordersExecTime?.executionTimeMilliseconds || 0) +
      Number(productsExecTime?.executionTimeMilliseconds || 0),
  };

  const formatExecutionTime = (executionTime?: ExecutionTime) => {
    if (!executionTime) {
      return "Noch keine Abfrage";
    }

    const seconds = Number(executionTime.executionTimeSeconds || 0);
    const milliseconds = Number(executionTime.executionTimeMilliseconds || 0);

    return `${seconds.toFixed(2)} s · ${milliseconds} ms`;
  };

  const fetchUsers = async () => {
    setloadingUsers(true);
    setproductDetails(undefined);
    const data = await getUsers(useLakeBase);
    if (data) {
      setUsers(data.data);
      setUserExecTime({
        executionTimeSeconds: data.executionTimeSeconds,
        executionTimeMilliseconds: data.executionTimeMilliseconds,
      });
    }
    setloadingUsers(false);
  };

  const fetchOrders = async (userID: number) => {
    setOrdersLoading(true);
    setproductDetails(undefined);
    const data = await getOrders(userID, useLakeBase);
    if (data) {
      setuserOrders(data.data);
      setOrdersExecTime({
        executionTimeSeconds: data.executionTimeSeconds,
        executionTimeMilliseconds: data.executionTimeMilliseconds,
      });
    }
    setOrdersLoading(false);
  };

  const getProductDetails = async (productIDList: number[]) => {
    setProductLoading(true);
    try {
      const res = await fetch("/api/data/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIDList }),
      });

      if (res.ok) {
        const data: ProductDetailsResponse = await res.json();
        setproductDetails(data.data);
        setProductsExecTime({
          executionTimeSeconds: data.executionTimeSeconds,
          executionTimeMilliseconds: data.executionTimeMilliseconds,
        });
      } else {
        throw new Error(`Error fetching product details: ${res.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setProductLoading(false);
    }
  };

  return (
    <Card className="flex h-full flex-1 flex-col border-white/70 bg-white/82 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
      <CardHeader className="border-b border-slate-200/70">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge
              variant={useLakeBase ? "default" : "secondary"}
              className="rounded-full px-3 py-1 uppercase tracking-[0.24em]">
              {useLakeBase ? "Lakebase" : "Delta Lake"}
            </Badge>
            <div>
              <CardTitle className="text-3xl">{label}</CardTitle>
              <CardDescription className="mt-2 max-w-xl leading-6">
                Wähle einen Benutzer aus, öffne dessen Bestellungen und rufe bei
                Bedarf die zugehörigen Produktdetails ab.
              </CardDescription>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.5rem] bg-slate-950 p-4 text-slate-50 shadow-lg sm:min-w-64">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Gesamtzeit
              </span>
              <Clock3 className="size-4 text-slate-400" />
            </div>
            <div>
              <p className="text-3xl font-semibold">
                {totalExecTime.executionTimeSeconds.toFixed(2)} s
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {totalExecTime.executionTimeMilliseconds} ms über alle Schritte
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 pt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card
            size="sm"
            className="border-slate-200/80 bg-white/75 shadow-none">
            <CardContent className="flex items-center gap-3 pt-4">
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Benutzer
                </p>
                <p className="text-lg font-semibold">{users?.length ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card
            size="sm"
            className="border-slate-200/80 bg-white/75 shadow-none">
            <CardContent className="flex items-center gap-3 pt-4">
              <div className="rounded-2xl bg-[color-mix(in_oklch,var(--chart-2)_22%,white)] p-2.5 text-foreground">
                <ShoppingCart className="size-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Bestellungen
                </p>
                <p className="text-lg font-semibold">
                  {userOrders?.length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            size="sm"
            className="border-slate-200/80 bg-white/75 shadow-none">
            <CardContent className="flex items-center gap-3 pt-4">
              <div className="rounded-2xl bg-[color-mix(in_oklch,var(--chart-3)_22%,white)] p-2.5 text-foreground">
                <Package className="size-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Produkte
                </p>
                <p className="text-lg font-semibold">
                  {productDetails?.length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200/80 bg-white/75 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Benutzer auswählen</CardTitle>
                  <Badge
                    variant={useLakeBase ? "default" : "secondary"}
                    className="rounded-full px-3 py-1 uppercase tracking-[0.24em]">
                    {useLakeBase ? "Lakebase" : "Delta Lake"}
                  </Badge>
                </div>
                <CardDescription>
                  Öffnet beim ersten Klick die Nutzerliste und lädt die
                  Datenquelle.
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {formatExecutionTime(userExecTime)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              onOpenChange={(open) => {
                if (open) fetchUsers();
              }}
              onValueChange={(v) => {
                if (v && !isNaN(Number(v))) {
                  fetchOrders(Number(v));
                }
              }}>
              <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white px-4 shadow-sm">
                <SelectValue
                  placeholder="Benutzer auswählen"
                  onClick={fetchUsers}
                />
              </SelectTrigger>
              {isMounted && (
                <SelectContent position="popper" sideOffset={8}>
                  <SelectGroup>
                    <SelectLabel>Benutzer</SelectLabel>

                    {loadingUsers ? (
                      <SelectItem
                        disabled
                        value="loading"
                        className="flex items-center justify-center">
                        <Spinner className="size-4" />
                      </SelectItem>
                    ) : users && users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem
                          key={user.user_id}
                          value={String(user.user_id)}>
                          {"name" in user
                            ? user.name
                            : `${user.vorname} ${user.nachname}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="empty">
                        Keine Benutzer geladen
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              )}
            </Select>

            <p className="text-sm text-muted-foreground">
              {loadingUsers
                ? "Benutzer werden geladen ..."
                : users && users.length > 0
                  ? `${users.length} Benutzer verfügbar`
                  : "Noch keine Benutzerdaten geladen"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/75 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Bestellungen</CardTitle>
                  <Badge
                    variant={useLakeBase ? "default" : "secondary"}
                    className="rounded-full px-3 py-1 uppercase tracking-[0.24em]">
                    {useLakeBase ? "Lakebase" : "Delta Lake"}
                  </Badge>
                </div>
                <CardDescription>
                  Zeigt die Orders des gewählten Benutzers samt Status und
                  Detailzugriff.
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {formatExecutionTime(ordersExecTime)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-8">
                <Spinner className="size-5" />
              </div>
            ) : userOrders && userOrders.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {userOrders.map((order) => (
                  <li
                    key={order.bestellung_id}
                    className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-slate-900">
                          Bestellung #{order.bestellung_id}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {order.product_ids.length} Produkte
                          </Badge>
                          <Badge variant="outline">
                            Status: {order.status}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => getProductDetails(order.product_ids)}>
                        Details anzeigen
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-muted-foreground">
                Keine Bestellungen für diesen Benutzer.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/75 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Produktliste</CardTitle>

                  <Badge
                    variant={"secondary"}
                    className="rounded-full px-3 py-1 uppercase tracking-[0.24em]">
                    {"Delta Lake"}
                  </Badge>
                </div>
                <CardDescription>
                  Produktdetails werden nach Auswahl einer Bestellung geladen.
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {formatExecutionTime(productsExecTime)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {productLoading ? (
              <div className="flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-8">
                <Spinner className="size-5" />
              </div>
            ) : productDetails && productDetails.length > 0 ? (
              <ul className="grid gap-3 lg:grid-cols-2">
                {productDetails.map((product) => (
                  <li
                    key={product.produkt_id}
                    className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {product.produkt_name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {product.kategorie}
                        </p>
                      </div>
                      <Badge>{product.preis}€</Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">
                        Lagerbestand
                      </span>
                      <span className="font-semibold text-slate-900">
                        {product.lagerbestand}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-muted-foreground">
                Noch keine Produktdetails geladen.
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default DataLayout;
