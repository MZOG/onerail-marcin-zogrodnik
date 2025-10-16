import { api } from "./axios";

export async function fetchData(url: string, options?: any) {
  const res = await api({
    url,
    method: options?.method || "GET",
    data: options?.body,
    headers: options?.headers,
  });
  return res.data;
}
