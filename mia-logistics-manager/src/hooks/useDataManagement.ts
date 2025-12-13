import { useState, useCallback, useMemo } from 'react';
import {
  CRUDService,
  CRUDConfig,
  CRUDQuery,
  CRUDResult,
  CRUDListResult,
} from '../shared/services/crudService';
import {
  ExportService,
  ExportConfig,
  ExportResult,
} from '../shared/services/exportService';
import {
  BusinessRulesService,
  ValidationContext,
} from '../shared/services/businessRulesService';
import {
  BulkOperationsService,
  BulkOperation,
  BulkOperationResult,
} from '../shared/services/bulkOperationsService';

export interface UseDataManagementOptions {
  config: CRUDConfig;
  enableValidation?: boolean;
  enableExport?: boolean;
  enableBulkOperations?: boolean;
}

export interface DataManagementState {
  loading: boolean;
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  error: string | null;
  selectedItems: any[];
  filters: any[];
  sort: any[];
  search: string;
}

export interface DataManagementActions {
  // CRUD Operations
  create: (data: any) => Promise<CRUDResult>;
  read: (id: string) => Promise<CRUDResult>;
  update: (id: string, data: any) => Promise<CRUDResult>;
  delete: (id: string) => Promise<CRUDResult>;

  // List Operations
  list: (query?: CRUDQuery) => Promise<CRUDListResult>;
  refresh: () => Promise<void>;

  // Selection
  selectItem: (item: any) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelection: (item: any) => void;

  // Filtering & Sorting
  setFilters: (filters: any[]) => void;
  setSort: (sort: any[]) => void;
  setSearch: (search: string) => void;
  setPagination: (page: number, pageSize: number) => void;

  // Export
  exportToExcel: (config: ExportConfig) => Promise<ExportResult>;
  exportToPDF: (config: ExportConfig) => Promise<ExportResult>;
  exportToCSV: (config: ExportConfig) => Promise<ExportResult>;

  // Bulk Operations
  bulkCreate: (data: any[]) => Promise<BulkOperationResult>;
  bulkUpdate: (
    updates: { id: string; data: any }[]
  ) => Promise<BulkOperationResult>;
  bulkDelete: (ids: string[]) => Promise<BulkOperationResult>;
  bulkUpsert: (data: any[], keyField: string) => Promise<BulkOperationResult>;

  // Validation
  validateData: (data: any, context?: ValidationContext) => Promise<any>;

  // Utility
  reset: () => void;
}

export const useDataManagement = (
  options: UseDataManagementOptions
): DataManagementState & DataManagementActions => {
  const {
    config,
    enableValidation = true,
    enableExport = true,
    enableBulkOperations = true,
  } = options;

  // Initialize services
  const crudService = useMemo(() => new CRUDService(config), [config]);
  const exportService = useMemo(
    () => new ExportService(crudService),
    [crudService]
  );
  const businessRulesService = useMemo(
    () => new BusinessRulesService(crudService),
    [crudService]
  );
  const bulkOperationsService = useMemo(
    () => new BulkOperationsService(crudService, businessRulesService),
    [crudService, businessRulesService]
  );

  // State
  const [state, setState] = useState<DataManagementState>({
    loading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    error: null,
    selectedItems: [],
    filters: [],
    sort: [],
    search: '',
  });

  // CRUD Operations
  const create = useCallback(
    async (data: any): Promise<CRUDResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Validate data if enabled
        if (enableValidation) {
          const validationResult = await businessRulesService.validateData(
            data,
            { operation: 'create' }
          );
          if (!validationResult.success) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: 'Dữ liệu không hợp lệ',
            }));
            return {
              success: false,
              error: 'Dữ liệu không hợp lệ',
              validationErrors: validationResult.errors,
            };
          }
        }

        const result = await crudService.create(data);

        if (result.success) {
          // Refresh list
          await refresh();
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || null,
        }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi không xác định';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [crudService, businessRulesService, enableValidation]
  );

  const read = useCallback(
    async (id: string): Promise<CRUDResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await crudService.getById(id);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || null,
        }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi không xác định';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [crudService]
  );

  const update = useCallback(
    async (id: string, data: any): Promise<CRUDResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Validate data if enabled
        if (enableValidation) {
          const validationResult = await businessRulesService.validateData(
            data,
            { operation: 'update' }
          );
          if (!validationResult.success) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: 'Dữ liệu không hợp lệ',
            }));
            return {
              success: false,
              error: 'Dữ liệu không hợp lệ',
              validationErrors: validationResult.errors,
            };
          }
        }

        const result = await crudService.update(id, data);

        if (result.success) {
          // Refresh list
          await refresh();
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || null,
        }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi không xác định';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [crudService, businessRulesService, enableValidation]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<CRUDResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await crudService.delete(id);

        if (result.success) {
          // Refresh list
          await refresh();
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || null,
        }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi không xác định';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [crudService]
  );

  // List Operations
  const list = useCallback(
    async (query?: CRUDQuery): Promise<CRUDListResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await crudService.list(query);

        if (result.success) {
          setState((prev) => ({
            ...prev,
            loading: false,
            data: result.data || [],
            total: result.total || 0,
            page: result.page || 1,
            pageSize: result.pageSize || 20,
            error: null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: result.error || null,
          }));
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi không xác định';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [crudService]
  );

  const refresh = useCallback(async (): Promise<void> => {
    const query: CRUDQuery = {
      filters: state.filters,
      sort: state.sort,
      pagination: { page: state.page, pageSize: state.pageSize },
      search: state.search,
    };

    await list(query);
  }, [
    list,
    state.filters,
    state.sort,
    state.page,
    state.pageSize,
    state.search,
  ]);

  // Selection
  const selectItem = useCallback((item: any) => {
    setState((prev) => ({
      ...prev,
      selectedItems: [...prev.selectedItems, item],
    }));
  }, []);

  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedItems: [...prev.data],
    }));
  }, [state.data]);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedItems: [],
    }));
  }, []);

  const toggleSelection = useCallback(
    (item: any) => {
      setState((prev) => {
        const isSelected = prev.selectedItems.some(
          (selected) => selected[config.primaryKey] === item[config.primaryKey]
        );

        if (isSelected) {
          return {
            ...prev,
            selectedItems: prev.selectedItems.filter(
              (selected) =>
                selected[config.primaryKey] !== item[config.primaryKey]
            ),
          };
        } else {
          return {
            ...prev,
            selectedItems: [...prev.selectedItems, item],
          };
        }
      });
    },
    [config.primaryKey]
  );

  // Filtering & Sorting
  const setFilters = useCallback((filters: any[]) => {
    setState((prev) => ({ ...prev, filters, page: 1 }));
  }, []);

  const setSort = useCallback((sort: any[]) => {
    setState((prev) => ({ ...prev, sort }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setState((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setPagination = useCallback((page: number, pageSize: number) => {
    setState((prev) => ({ ...prev, page, pageSize }));
  }, []);

  // Export
  const exportToExcel = useCallback(
    async (exportConfig: ExportConfig): Promise<ExportResult> => {
      if (!enableExport) {
        return { success: false, error: 'Export không được kích hoạt' };
      }

      const query: CRUDQuery = {
        filters: state.filters,
        sort: state.sort,
        search: state.search,
      };

      return await exportService.exportToExcel(exportConfig, query);
    },
    [exportService, enableExport, state.filters, state.sort, state.search]
  );

  const exportToPDF = useCallback(
    async (exportConfig: ExportConfig): Promise<ExportResult> => {
      if (!enableExport) {
        return { success: false, error: 'Export không được kích hoạt' };
      }

      const query: CRUDQuery = {
        filters: state.filters,
        sort: state.sort,
        search: state.search,
      };

      return await exportService.exportToPDF(exportConfig, query);
    },
    [exportService, enableExport, state.filters, state.sort, state.search]
  );

  const exportToCSV = useCallback(
    async (exportConfig: ExportConfig): Promise<ExportResult> => {
      if (!enableExport) {
        return { success: false, error: 'Export không được kích hoạt' };
      }

      const query: CRUDQuery = {
        filters: state.filters,
        sort: state.sort,
        search: state.search,
      };

      return await exportService.exportToCSV(exportConfig, query);
    },
    [exportService, enableExport, state.filters, state.sort, state.search]
  );

  // Bulk Operations
  const bulkCreate = useCallback(
    async (data: any[]): Promise<BulkOperationResult> => {
      if (!enableBulkOperations) {
        return {
          success: false,
          total: 0,
          successful: 0,
          failed: data.length,
          errors: [],
          warnings: [],
          autoFixes: [],
          duration: 0,
          summary: {} as any,
        };
      }

      const operation: BulkOperation = { type: 'create', data };
      const result = await bulkOperationsService.executeBulkOperation(
        operation,
        { operation: 'create' }
      );

      if (result.success) {
        await refresh();
      }

      return result;
    },
    [bulkOperationsService, enableBulkOperations, refresh]
  );

  const bulkUpdate = useCallback(
    async (
      updates: { id: string; data: any }[]
    ): Promise<BulkOperationResult> => {
      if (!enableBulkOperations) {
        return {
          success: false,
          total: 0,
          successful: 0,
          failed: updates.length,
          errors: [],
          warnings: [],
          autoFixes: [],
          duration: 0,
          summary: {} as any,
        };
      }

      const operation: BulkOperation = { type: 'update', updates };
      const result = await bulkOperationsService.executeBulkOperation(
        operation,
        { operation: 'update' }
      );

      if (result.success) {
        await refresh();
      }

      return result;
    },
    [bulkOperationsService, enableBulkOperations, refresh]
  );

  const bulkDelete = useCallback(
    async (ids: string[]): Promise<BulkOperationResult> => {
      if (!enableBulkOperations) {
        return {
          success: false,
          total: 0,
          successful: 0,
          failed: ids.length,
          errors: [],
          warnings: [],
          autoFixes: [],
          duration: 0,
          summary: {} as any,
        };
      }

      const operation: BulkOperation = { type: 'delete', ids };
      const result = await bulkOperationsService.executeBulkOperation(
        operation,
        { operation: 'delete' }
      );

      if (result.success) {
        await refresh();
      }

      return result;
    },
    [bulkOperationsService, enableBulkOperations, refresh]
  );

  const bulkUpsert = useCallback(
    async (data: any[], keyField: string): Promise<BulkOperationResult> => {
      if (!enableBulkOperations) {
        return {
          success: false,
          total: 0,
          successful: 0,
          failed: data.length,
          errors: [],
          warnings: [],
          autoFixes: [],
          duration: 0,
          summary: {} as any,
        };
      }

      const operation: BulkOperation = { type: 'upsert', data, keyField };
      const result = await bulkOperationsService.executeBulkOperation(
        operation,
        { operation: 'create' }
      );

      if (result.success) {
        await refresh();
      }

      return result;
    },
    [bulkOperationsService, enableBulkOperations, refresh]
  );

  // Validation
  const validateData = useCallback(
    async (data: any, context?: ValidationContext) => {
      if (!enableValidation) {
        return { success: true, errors: [], warnings: [], autoFixes: [] };
      }

      return await businessRulesService.validateData(
        data,
        context || { operation: 'create' }
      );
    },
    [businessRulesService, enableValidation]
  );

  // Utility
  const reset = useCallback(() => {
    setState({
      loading: false,
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      error: null,
      selectedItems: [],
      filters: [],
      sort: [],
      search: '',
    });
  }, []);

  return {
    ...state,
    create,
    read,
    update,
    delete: deleteItem,
    list,
    refresh,
    selectItem,
    selectAll,
    clearSelection,
    toggleSelection,
    setFilters,
    setSort,
    setSearch,
    setPagination,
    exportToExcel,
    exportToPDF,
    exportToCSV,
    bulkCreate,
    bulkUpdate,
    bulkDelete,
    bulkUpsert,
    validateData,
    reset,
  };
};
