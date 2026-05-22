import { useState, useMemo, useCallback } from 'react';
import {
  AssignmentEntityType,
  IndividualOption,
  DesignationOption,
  DepartmentOption,
  RoleOption,
} from '../types';
import { useGetUsersForFilterQuery } from '../../../store/apis/user.api';
import { useGetMasterConfigByCategoryQuery } from '../../../store/apis/masterConfig.api';
import { useListRolesQuery } from '../../../store/apis/rbac.api';

export type EntityOption = IndividualOption | DesignationOption | DepartmentOption | RoleOption;

interface UseAssignmentOptionsReturn {
  options: EntityOption[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => Promise<void>;
}

export const useAssignmentOptions = (
  entityType: AssignmentEntityType | null
): UseAssignmentOptionsReturn => {
  const [searchTerm, setSearchTerm] = useState('');

  const individualsQuery = useGetUsersForFilterQuery(undefined, {
    skip: entityType !== 'individual',
  });

  const departmentsQuery = useGetMasterConfigByCategoryQuery('department', {
    skip: entityType !== 'department',
  });

  const designationsQuery = useGetMasterConfigByCategoryQuery('designation', {
    skip: entityType !== 'designation',
  });

  const rolesQuery = useListRolesQuery(undefined, {
    skip: entityType !== 'role',
  });

  const isLoading = useMemo(() => {
    switch (entityType) {
      case 'individual':
        return individualsQuery.isLoading;
      case 'department':
        return departmentsQuery.isLoading;
      case 'designation':
        return designationsQuery.isLoading;
      case 'role':
        return rolesQuery.isLoading;
      default:
        return false;
    }
  }, [entityType, individualsQuery.isLoading, departmentsQuery.isLoading, designationsQuery.isLoading, rolesQuery.isLoading]);

  const error = useMemo(() => {
    switch (entityType) {
      case 'individual':
        return individualsQuery.error ? 'Failed to load individuals' : null;
      case 'department':
        return departmentsQuery.error ? 'Failed to load departments' : null;
      case 'designation':
        return designationsQuery.error ? 'Failed to load designations' : null;
      case 'role':
        return rolesQuery.error ? 'Failed to load roles' : null;
      default:
        return null;
    }
  }, [entityType, individualsQuery.error, departmentsQuery.error, designationsQuery.error, rolesQuery.error]);

  const options = useMemo((): EntityOption[] => {
    if (!entityType) return [];

    switch (entityType) {
      case 'individual': {
        const users = individualsQuery.data ?? [];
        let result: IndividualOption[] = users.map((user) => ({
          _id: user.id,
          firstName: user.fullName.split(' ')[0] || '',
          lastName: user.fullName.split(' ').slice(1).join(' ') || '',
          workEmail: '',
        }));

        if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();
          result = result.filter((user) => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            return fullName.includes(lowerSearch);
          });
        }
        return result;
      }
      case 'department': {
        const departments = departmentsQuery.data ?? [];
        // Use _id from transformed response (handles both API id and _id via transformResponse)
        return departments.map((dept: any) => ({
          _id: dept._id ?? dept.id,
          name: dept.displayName,
          count: undefined,
        }));
      }
      case 'designation': {
        const designations = designationsQuery.data ?? [];
        return designations.map((des: any) => ({
          _id: des._id ?? des.id,
          name: des.displayName,
          count: undefined,
        }));
      }
      case 'role': {
        const roles = (rolesQuery.data as any)?.data || rolesQuery.data || [];
        return roles.map((role: any) => ({
          _id: role.name,
          name: role.name,
          count: undefined,
        }));
      }
      default:
        return [];
    }
  }, [entityType, searchTerm, individualsQuery.data, departmentsQuery.data, designationsQuery.data, rolesQuery.data]);

  const refetch = useCallback(async () => {
    switch (entityType) {
      case 'individual':
        await individualsQuery.refetch();
        break;
      case 'department':
        await departmentsQuery.refetch();
        break;
      case 'designation':
        await designationsQuery.refetch();
        break;
      case 'role':
        await rolesQuery.refetch();
        break;
    }
  }, [entityType, individualsQuery, departmentsQuery, designationsQuery, rolesQuery]);

  return {
    options,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refetch,
  };
};

// Get display label for an entity option
export const getOptionLabel = (option: EntityOption, entityType: AssignmentEntityType): string => {
  switch (entityType) {
    case 'individual': {
      const ind = option as IndividualOption;
      return `${ind.firstName} ${ind.lastName}`;
    }
    case 'designation':
      return (option as DesignationOption).name;
    case 'department':
      return (option as DepartmentOption).name;
    case 'role':
      return (option as RoleOption).name;
    default:
      return '';
  }
};

// Get unique identifier for an entity option
export const getOptionValue = (option: EntityOption): string => {
  if ('_id' in option) return option._id;
  return '';
};

// Get subtitle/secondary text for display
export const getOptionSubtitle = (option: EntityOption, entityType: AssignmentEntityType): string | null => {
  switch (entityType) {
    case 'individual': {
      const ind = option as IndividualOption;
      return ind.workEmail || null;
    }
    case 'designation':
    case 'department':
    case 'role': {
      const opt = option as { count?: number };
      if (opt.count !== undefined) {
        return `${opt.count} employee${opt.count !== 1 ? 's' : ''}`;
      }
      return null;
    }
    default:
      return null;
  }
};

export default useAssignmentOptions;
