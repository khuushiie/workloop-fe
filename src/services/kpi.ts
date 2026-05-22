import { apiAxios } from "./api";

class KpiApiService {
  async getAllFlags(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<
    | { key: string; name: string; enabled: boolean; description?: string }[]
    | {
        data: { key: string; name: string; enabled: boolean; description?: string }[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }
  > {
    const query: Record<string, string | number> = {};
    if (params?.page !== undefined) query.page = params.page;
    if (params?.limit !== undefined) query.limit = params.limit;
    if (params?.search) query.search = params.search;

    const res = await apiAxios.get(
      `/v2/feature-flags/public`,
      Object.keys(query).length ? { params: query } : undefined
    );
    return Array.isArray(res)
      ? (res as { key: string; name: string; enabled: boolean; description?: string }[])
      : (res as { data: { key: string; name: string; enabled: boolean; description?: string }[] }) || [];
  }

  async toggleFlag(
    key: string
  ): Promise<{ key: string; name: string; enabled: boolean; description?: string }> {
    const res = await apiAxios.put(`/config/flags/${key}/toggle`);
    return res as unknown as { key: string; name: string; enabled: boolean; description?: string };
  }

  async deleteFlag(key: string): Promise<{ message: string }> {
    return (await apiAxios.delete(`/config/flags/${key}`)) as unknown as { message: string };
  }
}

export const kpiApi = new KpiApiService();
