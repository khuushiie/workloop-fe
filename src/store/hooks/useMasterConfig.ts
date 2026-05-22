import { useDispatch, useSelector } from "react-redux";
import {
  useGetCategoryCodesQuery,
  useGetConfigsGroupedByCategoryQuery,
  useGetAllConfigsWithPaginationQuery,
  useGetConfigsByCategoryCodeQuery,
  useGetActiveConfigCodesQuery,
  useGetActiveConfigOptionsQuery,
  useCreateMasterConfigMutation,
  useGetMasterConfigByIdQuery,
  useUpdateMasterConfigMutation,
  useDeleteMasterConfigMutation,
} from "../apis/masterConfig.api";

import {
  setSelectedCategoryCode,
  setSelectedConfigId,
  setPagination,
  openConfigDrawer,
  closeConfigDrawer,
} from "../slices/masterConfigSlice";

export const useMasterConfig = () => {
  const dispatch = useDispatch();

  const {
    selectedCategoryCode,
    selectedConfigId,
    skip,
    limit,
    isDrawerOpen,
  } = useSelector((state: any) => state.masterConfig);

  /* ========= Queries ========= */

  const categoryCodesQuery = useGetCategoryCodesQuery();

  const groupedConfigsQuery = useGetConfigsGroupedByCategoryQuery();

  const paginatedConfigsQuery = useGetAllConfigsWithPaginationQuery({
    skip,
    limit,
  });

  const configsByCategoryQuery = useGetConfigsByCategoryCodeQuery(
    {
      categoryCode: selectedCategoryCode!,
      skip,
      limit,
    },
    {
      skip: !selectedCategoryCode,
    }
  );

  const activeCodesQuery = useGetActiveConfigCodesQuery(
    selectedCategoryCode!,
    { skip: !selectedCategoryCode }
  );

  const activeOptionsQuery = useGetActiveConfigOptionsQuery(
    selectedCategoryCode!,
    { skip: !selectedCategoryCode }
  );

  const selectedConfigQuery = useGetMasterConfigByIdQuery(
    selectedConfigId!,
    { skip: !selectedConfigId }
  );

  /* ========= Mutations ========= */

  const [createMasterConfig, createState] =
    useCreateMasterConfigMutation();

  const [updateMasterConfig, updateState] =
    useUpdateMasterConfigMutation();

  const [deleteMasterConfig, deleteState] =
    useDeleteMasterConfigMutation();

  /* ========= Helpers ========= */

  const setCategory = (categoryCode: string | null) =>
    dispatch(setSelectedCategoryCode(categoryCode));

  const setConfig = (id: string | null) =>
    dispatch(setSelectedConfigId(id));

  const setPage = (skip: number, limit: number) =>
    dispatch(setPagination({ skip, limit }));

  const openDrawer = () => dispatch(openConfigDrawer());
  const closeDrawer = () => dispatch(closeConfigDrawer());

  const isLoading =
    categoryCodesQuery.isLoading ||
    groupedConfigsQuery.isLoading ||
    paginatedConfigsQuery.isLoading ||
    configsByCategoryQuery.isLoading ||
    createState.isLoading ||
    updateState.isLoading ||
    deleteState.isLoading;

  return {
    /* ===== UI State ===== */
    selectedCategoryCode,
    selectedConfigId,
    skip,
    limit,
    isDrawerOpen,

    /* ===== Data ===== */
    categoryCodes: categoryCodesQuery.data,
    groupedConfigs: groupedConfigsQuery.data,
    paginatedConfigs: paginatedConfigsQuery.data,
    configsByCategory: configsByCategoryQuery.data,
    activeCodes: activeCodesQuery.data,
    activeOptions: activeOptionsQuery.data,
    selectedConfig: selectedConfigQuery.data,

    /* ===== Actions ===== */
    setCategory,
    setConfig,
    setPage,
    openDrawer,
    closeDrawer,

    /* ===== Mutations ===== */
    createMasterConfig,
    updateMasterConfig,
    deleteMasterConfig,

    /* ===== States ===== */
    isLoading,
  };
};
