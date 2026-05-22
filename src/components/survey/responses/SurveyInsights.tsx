import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import Button from '../../common/Button';
import SearchInput from '../../common/SearchInput';
import DatePicker from '../../common/DatePicker';
import FilterWrapper from '../../common/FilterWrapper';
import TabSelector from '../../employee-service/component/TabSelector';
import { StatsCards, StatCardConfig, downloadExport } from '../common';
import CompletedResponsesTab from './components/CompletedResponsesTab';
import PendingNotStartedTab from './components/PendingNotStartedTab';
import { useSurveyInsights } from './hooks/useSurveyInsights';
import { InsightsTabKey } from './types';
import { scrollToTop } from '../hooks';
import Badge from '../../common/Badge';
// import { useLazyExportResponsesQuery } from '../../../store/apis/survey.api';

const statsCardsConfig: StatCardConfig[] = [
  { key: 'totalAssigned', label: 'Total Assigned', color: 'bg-primary-500', icon: Users },
  { key: 'completed', label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  { key: 'pending', label: 'Pending', color: 'bg-amber-500', icon: Clock },
  { key: 'notStarted', label: 'Not Started', color: 'bg-red-500', icon: AlertCircle },
];

const SurveyInsights: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { stats, loading, error, activeTab, setActiveTab } = useSurveyInsights(surveyId || '');
  // const [exportResponses, { isFetching: exporting }] = useLazyExportResponsesQuery();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });

  const handleDateChange = (date: Dayjs | null, field: 'start' | 'end') => {
    const dateStr = date?.format('YYYY-MM-DD') || '';
    setDateRange((prev) => ({
      startDate: field === 'start' ? dateStr : prev.startDate,
      endDate: field === 'end' ? dateStr : prev.endDate,
    }));
  };

  const tabs: { k: InsightsTabKey; label: string }[] = [
    { k: 'completed', label: `Completed (${stats.completed})` },
    { k: 'pending', label: `Pending / Not Started (${stats.pending + stats.notStarted})` },
  ];

  const handleBack = () => {
    navigate('/survey-responses');
    scrollToTop();
  };

  // const handleExport = async () => {
  //   if (!surveyId) return;
  //   try {
  //     const result = await exportResponses({ surveyId, format: 'excel' }).unwrap();
  //     downloadExport(result, `survey-${surveyId}-responses.xlsx`);
  //   } catch (error) {
  //     console.error('Export failed:', error);
  //   }
  // };

  const formatDate = (date: string) => date ? dayjs(date).format('MMM D, YYYY') : '';

  if (!surveyId) {
    return (
      <div className="p-6">
        <p className="text-red-500">Survey ID is required</p>
        <Button appearance="secondary" onClick={handleBack} className="mt-4">Back to Responses</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={handleBack}
            className="mt-1 p-2 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 bg-white"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {loading ? "Loading..." : stats.surveyTitle}
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {!loading && stats.startDate && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-0">
                    <Calendar className="w-4 h-4" />
                    <span>Timeline: {dayjs(stats.startDate).format('DD MMM YYYY')} - {dayjs(stats.endDate).format('DD MMM YYYY')}</span>
                  </div>
                )}
              </div>
            </h1>

          </div>
        </div>
        {/* <Button
          htmlType="button"
          size="large"
          appearance="primary"
          onClick={handleExport}
          loading={exporting}
          icon={<Download className="w-5 h-5" />}
        >
          Export Report
        </Button> */}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

      {/* Stats Cards */}
      <StatsCards stats={stats} cards={statsCardsConfig} loading={loading} gridCols="xl:grid-cols-4" />

      {/* Filters */}
      <FilterWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name..."
          />
        </div>
      </FilterWrapper>

      {/* Tab Selector */}
      <TabSelector tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        {activeTab === 'completed' ? (
          <CompletedResponsesTab surveyId={surveyId} search={search} />
        ) : (
          <PendingNotStartedTab surveyId={surveyId} pendingCount={stats.pending} notStartedCount={stats.notStarted} search={search} />
        )}
      </div>
    </div>
  );
};

export default SurveyInsights;
