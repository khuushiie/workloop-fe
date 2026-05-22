import { useNavigate } from 'react-router-dom';
import { Download, ClipboardList, CheckCircle, PlayCircle } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import Button from '../../common/Button';
import SearchInput from '../../common/SearchInput';
import Select from '../../common/Select';
import DatePicker from '../../common/DatePicker';
import Pagination from '../../common/Pagination';
import FilterWrapper from '../../common/FilterWrapper';
import { StatsCards, StatCardConfig, downloadExport } from '../common';
import ResponsesTable from './components/ResponsesTable';
import { useResponsesOverview } from './hooks/useResponsesOverview';
import { SurveyResponseSummary, SurveyStatus } from './types';
// import { useLazyExportResponsesQuery } from '../../../store/apis/survey.api';
import { scrollToTop } from '../hooks';
import { useEffect } from 'react';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

// Stats cards configuration
const statsCardsConfig: StatCardConfig[] = [
  { key: 'surveysCreated', label: 'Surveys Created', color: 'bg-primary-500', icon: ClipboardList },
  { key: 'activeSurveys', label: 'Active', color: 'bg-green-500', icon: PlayCircle },
  { key: 'completedSurveys', label: 'Completed', color: 'bg-slate-500', icon: CheckCircle },
];

const ResponsesOverview: React.FC = () => {
  const navigate = useNavigate();
  // const [exportResponses, { isFetching: exporting }] = useLazyExportResponsesQuery();

  const {
    stats,
    statsLoading,
    surveys,
    surveysLoading,
    totalSurveys,
    filters,
    pagination,
    setFilters,
    setPagination,
    clearFilters,
  } = useResponsesOverview();

  const handleViewInsights = (survey: SurveyResponseSummary) => {
    navigate(`/survey-responses/${survey.id}/insights`);
    scrollToTop();
  };

  useEffect(() => {
    clearFilters();
  }, []);

  // const handleExport = async () => {
  //   try {
  //     const result = await exportResponses({ surveyId: 'all', format: 'excel' }).unwrap();
  //     downloadExport(result, `survey-responses-${dayjs().format('YYYY-MM-DD')}.xlsx`);
  //   } catch (error) {
  //     console.error('Export failed:', error);
  //   }
  // };

  const handleDateChange = (date: Dayjs | null, field: 'start' | 'end') => {
    const dateStr = date?.format('YYYY-MM-DD') || '';
    setFilters({
      ...filters,
      dateRange: {
        startDate: field === 'start' ? dateStr : (filters.dateRange?.startDate || ''),
        endDate: field === 'end' ? dateStr : (filters.dateRange?.endDate || ''),
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Survey Responses
          </h1>
        </div>
        {/* <Button
          htmlType="button"
          size="large"
          appearance="primary"
          onClick={handleExport}
          loading={exporting}
          icon={<Download className="w-5 h-5" />} // Standard icon scale
        >
          Export All
        </Button> */}
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} cards={statsCardsConfig} loading={statsLoading} gridCols="xl:grid-cols-3" />

      <FilterWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 w-full gap-4">
          <SearchInput
            label="Search"
            value={filters.search}
            onChange={(val) => setFilters({ ...filters, search: val })}
            placeholder="Search surveys..."
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(val) => setFilters({ ...filters, status: val as SurveyStatus })}
            options={statusOptions}
            placeholder="All Status"
          />
        </div>
      </FilterWrapper>

      <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-hidden ">
        <ResponsesTable 
          data={surveys} 
          loading={surveysLoading} 
          onViewInsights={handleViewInsights} 
          renderColumnSelector={(selector) => (
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Surveys ({totalSurveys})</h3>
              {selector}
            </div>
          )}
        />
        {totalSurveys > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalItems={totalSurveys}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            onItemsPerPageChange={(limit) => setPagination({ ...pagination, limit, page: 1 })}
            itemsPerPageOptions={[5, 10, 20, 50]}
          />
        )}
      </div>
    </div>
  );
};

export default ResponsesOverview;
