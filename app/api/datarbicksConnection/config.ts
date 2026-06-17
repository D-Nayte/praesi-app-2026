const catalog = "test_catalog";
const schema = "demo_andy_shop";

export const tables = {
  users: catalog + "." + schema + ".users",
  products: catalog + "." + schema + ".produkte",
  orders: catalog + "." + schema + ".bestellungen",
};

export const lakebaseTables = {
  users: schema + ".users_lb_synced",
  orders: schema + ".bestellung_lb_synced",
};
