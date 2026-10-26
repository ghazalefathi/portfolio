import { queryOptions } from "@tanstack/react-query";
import { getAdminExists, getPortfolio, getProjectDetail } from "./portfolio.functions";

export const portfolioQuery = () =>
  queryOptions({ queryKey: ["portfolio", "home"], queryFn: () => getPortfolio() });

export const projectDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["portfolio", "project", id],
    queryFn: () => getProjectDetail({ data: { id } }),
  });

export const adminExistsQuery = () =>
  queryOptions({ queryKey: ["admin-exists"], queryFn: () => getAdminExists() });
