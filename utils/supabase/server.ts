import { cookies } from "next/headers";
import { MySQLClient } from "@/lib/mysql-adapter";

export const createClient = (cookieStore?: Awaited<ReturnType<typeof cookies>> | any) => {
  return new MySQLClient(cookieStore);
};
