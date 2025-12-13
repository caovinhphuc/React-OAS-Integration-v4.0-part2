import { useState, useEffect, useCallback } from 'react';
import { Employee } from '../../../shared/types/commonTypes';
import { employeesService } from '../../../services/googleSheets/employeesService';
import { logService } from '../../../services/logService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeesService.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Không thể tải danh sách nhân viên');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create employee
  const createEmployee = useCallback(
    async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newEmployee = await employeesService.createEmployee(employee);
        if (newEmployee) {
          setEmployees((prev) => [...prev, newEmployee]);
          logService.write({
            action: 'EMPLOYEE_CREATE',
            resource: 'employees',
            details: JSON.stringify({ id: newEmployee.id, email: newEmployee.email }),
          });
          return { success: true, data: newEmployee };
        }
        return { success: false, error: 'Không thể tạo nhân viên' };
      } catch (err) {
        console.error('Error creating employee:', err);
        return { success: false, error: 'Lỗi khi tạo nhân viên' };
      }
    },
    []
  );

  // Update employee
  const updateEmployee = useCallback(
    async (id: string, updates: Partial<Employee>) => {
      try {
        const updatedEmployee = await employeesService.updateEmployee(
          id,
          updates
        );
        if (updatedEmployee) {
          setEmployees((prev) =>
            prev.map((emp) => (emp.id === id ? updatedEmployee : emp))
          );
          logService.write({
            action: 'EMPLOYEE_UPDATE',
            resource: 'employees',
            details: JSON.stringify({ id }),
          });
          return { success: true, data: updatedEmployee };
        }
        return { success: false, error: 'Không thể cập nhật nhân viên' };
      } catch (err) {
        console.error('Error updating employee:', err);
        return { success: false, error: 'Lỗi khi cập nhật nhân viên' };
      }
    },
    []
  );

  // Delete employee
  const deleteEmployee = useCallback(async (id: string) => {
    try {
      const success = await employeesService.deleteEmployee(id);
      if (success) {
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        logService.write({
          action: 'EMPLOYEE_DELETE',
          resource: 'employees',
          details: JSON.stringify({ id }),
        });
        return { success: true };
      }
      return { success: false, error: 'Không thể xóa nhân viên' };
    } catch (err) {
      console.error('Error deleting employee:', err);
      return { success: false, error: 'Lỗi khi xóa nhân viên' };
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
