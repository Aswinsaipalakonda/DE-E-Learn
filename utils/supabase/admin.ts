import { MySQLClient } from "@/lib/mysql-adapter";

export function createAdminClient() {
  const client = new MySQLClient();
  return {
    client,
    hasServiceKey: true,
  };
}
