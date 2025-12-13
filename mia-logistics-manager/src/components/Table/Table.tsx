import React, { useState, useMemo, useRef, useEffect } from "react";
import { Icon } from "../../atoms/Icon";
import styles from "./Table.module.scss";

export interface TableColumn<T = any> {
  key: string;
  title: string | React.ReactNode;
  dataIndex?: string;
  width?: number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  dataSource: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
  };
  rowKey?: string | ((record: T) => string);
  onRow?: (
    record: T,
    index: number
  ) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
  };
  className?: string;
  size?: "small" | "middle" | "large";
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  emptyText?: string;
  showHeader?: boolean;
}

export const Table = <T extends Record<string, any>>({
  columns,
  dataSource,
  loading = false,
  pagination,
  rowKey = "id",
  onRow,
  className = "",
  size = "middle",
  bordered = false,
  striped = false,
  hoverable = true,
  emptyText = "Không có dữ liệu",
  showHeader = true,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    canScrollTop: false,
    canScrollBottom: false,
  });

  const tableWrapperRef = useRef<HTMLDivElement>(null);

  // Check scroll state
  const checkScrollState = () => {
    if (!tableWrapperRef.current) return;

    const {
      scrollLeft,
      scrollTop,
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
    } = tableWrapperRef.current;

    setScrollState({
      canScrollLeft: scrollLeft > 0,
      canScrollRight: scrollLeft < scrollWidth - clientWidth,
      canScrollTop: scrollTop > 0,
      canScrollBottom: scrollTop < scrollHeight - clientHeight,
    });
  };

  // Scroll functions
  const scrollLeft = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;

    checkScrollState();
    wrapper.addEventListener("scroll", checkScrollState);
    window.addEventListener("resize", checkScrollState);

    return () => {
      wrapper.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [dataSource]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return dataSource;

    return [...dataSource].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key);
      if (!column?.sorter) return 0;

      const result = column.sorter(a, b);
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [dataSource, sortConfig, columns]);

  // Handle sort
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    setSortConfig((prev) => {
      if (prev?.key === column.key) {
        return prev.direction === "asc"
          ? { key: column.key, direction: "desc" }
          : null;
      }
      return { key: column.key, direction: "asc" };
    });
  };

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  // Render cell content
  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    const value = column.dataIndex ? record[column.dataIndex] : undefined;

    if (column.render) {
      return column.render(value, record, index);
    }

    return value;
  };

  // Render sort icon
  const renderSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;

    const isActive = sortConfig?.key === column.key;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <span className={styles.sortIcon}>
        {direction === "asc" ? (
          <Icon name="arrow_up" size={12} />
        ) : direction === "desc" ? (
          <Icon name="arrow_down" size={12} />
        ) : (
          <Icon name="arrow_up" size={12} className={styles.sortIconInactive} />
        )}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.tableContainer} ${className}`}>
        <div className={styles.loading}>
          <Icon name="sync" size={24} className={styles.loadingIcon} />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!dataSource.length) {
    return (
      <div className={`${styles.tableContainer} ${className}`}>
        <div className={styles.empty}>
          <Icon name="inventory" size={48} className={styles.emptyIcon} />
          <span>{emptyText}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <div className={styles.tableWrapper} ref={tableWrapperRef}>
        {/* Scroll indicators */}
        <div
          className={`${styles.scrollIndicator} ${styles.scrollLeft} ${!scrollState.canScrollLeft ? styles.hidden : ""}`}
        />
        <div
          className={`${styles.scrollIndicator} ${styles.scrollRight} ${!scrollState.canScrollRight ? styles.hidden : ""}`}
        />
        <div
          className={`${styles.scrollIndicator} ${styles.scrollTop} ${!scrollState.canScrollTop ? styles.hidden : ""}`}
        />
        <div
          className={`${styles.scrollIndicator} ${styles.scrollBottom} ${!scrollState.canScrollBottom ? styles.hidden : ""}`}
        />

        {/* Scroll buttons */}
        <div className={`${styles.scrollButtons} ${styles.scrollButtonsLeft}`}>
          <button
            className={styles.scrollButton}
            onClick={scrollLeft}
            disabled={!scrollState.canScrollLeft}
            aria-label="Cuộn trái"
          >
            <Icon name="arrow_left" size={16} />
          </button>
        </div>
        <div className={`${styles.scrollButtons} ${styles.scrollButtonsRight}`}>
          <button
            className={styles.scrollButton}
            onClick={scrollRight}
            disabled={!scrollState.canScrollRight}
            aria-label="Cuộn phải"
          >
            <Icon name="arrow_right" size={16} />
          </button>
        </div>

        <table
          className={`${styles.table} ${styles[`table--${size}`]} ${
            bordered ? styles.tableBordered : ""
          } ${striped ? styles.tableStriped : ""} ${
            hoverable ? styles.tableHoverable : ""
          }`}
        >
          {showHeader && (
            <thead className={styles.tableHead}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${styles.tableHeader} ${
                      column.sortable ? styles.sortable : ""
                    }`}
                    style={{
                      width: column.width,
                      textAlign: column.align || "left",
                    }}
                    onClick={() => handleSort(column)}
                  >
                    <div className={styles.headerContent}>
                      <span>{column.title}</span>
                      {renderSortIcon(column)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody className={styles.tableBody}>
            {sortedData.map((record, index) => {
              const rowProps = onRow?.(record, index) || {};
              const key = getRowKey(record, index);

              return (
                <tr
                  key={key}
                  className={rowProps.className}
                  style={rowProps.style}
                  onClick={rowProps.onClick}
                  onDoubleClick={rowProps.onDoubleClick}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={styles.tableCell}
                      style={{
                        textAlign: column.align || "left",
                      }}
                      data-label={column.title}
                    >
                      {renderCell(column, record, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(
              pagination.current * pagination.pageSize,
              pagination.total
            )}{" "}
            trong tổng số {pagination.total} mục
          </div>

          <div className={styles.paginationControls}>
            {/* Page Size Selector */}
            {pagination.showSizeChanger && (
              <div className={styles.pageSizeSelector}>
                <span>Số hàng mỗi trang:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    pagination.onChange(1, parseInt(e.target.value))
                  }
                  className={styles.pageSizeSelect}
                >
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map(
                    (size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            <div className={styles.paginationButtons}>
              <button
                className={styles.paginationButton}
                disabled={pagination.current <= 1}
                onClick={() =>
                  pagination.onChange(
                    pagination.current - 1,
                    pagination.pageSize
                  )
                }
              >
                <Icon name="arrow_left" size={16} />
              </button>

              <span className={styles.paginationPage}>
                Trang {pagination.current}
              </span>

              <button
                className={styles.paginationButton}
                disabled={
                  pagination.current * pagination.pageSize >= pagination.total
                }
                onClick={() =>
                  pagination.onChange(
                    pagination.current + 1,
                    pagination.pageSize
                  )
                }
              >
                <Icon name="arrow_right" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
