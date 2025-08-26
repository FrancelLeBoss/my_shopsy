import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export function useCategories() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get<any[]>(`api/categories`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
