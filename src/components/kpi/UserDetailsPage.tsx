import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Info,
  Target,
  Trophy
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useAuth } from "../../store/hooks/useAuth";
import { useGetMyPerformanceUserDetailsQuery } from "../../store/apis/kpi.api";
import { KpiTimeline } from "../../types/kpi.api.types";
import { OverallLeaderboardSkeleton } from "../../utils/SkeletonUtils";
import { Button, Select, SimpleTooltip } from "../common";
import { KpiCompletionHistorySkeleton, KpiSetListSkeleton, SetCompletionTrendSkeleton, UserProfileHeaderSkeleton, WeeklyKpiAssessmentSkeleton } from "./Skeleton";

interface UserDetailsPageProps { }

interface SetOverAllKpi {
  setId: number;
  setName: string;
  setDescription: string;
  total: number;
  completedCount: number;
  percentage: number;
}

const calculateDateRange = (timeRange: string, offset: number) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    let rangeLabel = '';
    
    // Set to the start/end of the current period first
    if (timeRange === 'monthly') {
        // Calculate the month shifted by 'offset'
        const targetMonth = now.getMonth() - offset;
        startDate = new Date(now.getFullYear(), targetMonth, 1);
        endDate = new Date(now.getFullYear(), targetMonth + 1, 0); // Last day of the month
        
        rangeLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
    } else if (timeRange === 'quarterly') {
        // Calculate the quarter shifted by 'offset' * 3 months
        const currentMonth = now.getMonth();
        const monthsToShift = offset * 3;
        
        const startMonthOfTargetQuarter = currentMonth - (currentMonth % 3) - monthsToShift;
        
        startDate = new Date(now.getFullYear(), startMonthOfTargetQuarter, 1);
        endDate = new Date(now.getFullYear(), startMonthOfTargetQuarter + 3, 0);
        
        const quarterNum = Math.floor(startDate.getMonth() / 3) + 1;
        rangeLabel = `Q${quarterNum} ${startDate.getFullYear()}`;
        
    } else if (timeRange === 'yearly') {
        // Calculate the year shifted by 'offset'
        const targetYear = now.getFullYear() - offset;
        startDate = new Date(targetYear, 0, 1);
        endDate = new Date(targetYear, 11, 31);
        
        rangeLabel = String(targetYear);
    }
    
    // Ensure all dates are normalized for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate, rangeLabel };
};  

const UserDetailsPage: React.FC<UserDetailsPageProps> = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('monthly');
  const [offset, setOffset] = useState(0);
  const { user: authUser } = useAuth();

  const { data: userData, isLoading: loading, isFetching: fetchingUserDetails, error: queryError } =
    useGetMyPerformanceUserDetailsQuery(
      {
        userId: userId ?? "",
        completionTrendTimeline: timeRange,
        completionTrendOffset: offset,
      },
      { skip: !userId }
    );

  const error = queryError
    ? ("data" in queryError && queryError.data && typeof (queryError.data as any)?.message === "string"
        ? (queryError.data as any).message
        : (queryError as Error)?.message ?? "Failed to load user details")
    : "";

  const currentUserId = authUser?.id;
  const isOwnProfile = userId === currentUserId;
  const showBack = !isOwnProfile;

  // Carousel offsets for KPI History (weekly/monthly/yearly)
  const [weeklyOffset, setWeeklyOffset] = useState(0);
  const [monthlyOffset, setMonthlyOffset] = useState(0);
  const [yearlyOffset, setYearlyOffset] = useState(0);

  const weeklySetStats = useMemo(() => {
    const kpiLookup: Record<string, string[]> = {};

    userData?.assignments?.forEach((assign: any) => {
      const setId = assign.setId?.id;
      if (setId && assign.setId?.kpis) {
        kpiLookup[setId] = assign.setId.kpis.map((k: any) => k.name);
      }
    });

    const timelineKeys = ["weekly", "monthly", "yearly"] as const;
    let allSets = timelineKeys.flatMap(
      (timeline) =>
        userData?.kpiHistory?.[timeline]?.flatMap((item: any) =>
          (item.sets || []).map((set: any) => ({
            ...set,
            timeline,
            setDescription: set.description,
            period: item.period,
            kpis: set.kpis,
            periodStart: item.periodStart,
            periodEnd: item.periodEnd,
          }))

        ) || []
    );

    if (allSets.length === 0 && userData?.assignments?.length) {
      allSets = userData.assignments.map((assignment: any) => ({
        setId: assignment.setId.id,
        setName: assignment.setId.name,
        setDescription: assignment.setId.description,
        timeline: assignment.setId.timeline,
        completed: false,
        totalKpis: assignment.setId.kpis?.length || 0,
        kpis: assignment.setId.kpis,
        period: "Current",
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
      }));
    }

    const overAllKpi = allSets.reduce<Record<string, SetOverAllKpi & { kpis: [] }>>(
      (acc, item: any) => {
        const setId = item.setId;
        const setName = item.setName;
        const completed = item.completed;
        const kpis = item.kpis || [];
        const setDescription = item.setDescription;

        if (!acc[setId]) {
          acc[setId] = {
            setId,
            setName,
            setDescription,
            kpis,
            total: 0,
            completedCount: 0,
            percentage: 0,
          };
        }

        acc[setId].total += 1;
        if (completed) acc[setId].completedCount += 1;

        return acc;
      },
      {}
    );

    const overAllKpiArray = Object.values(overAllKpi).map((set) => {
      const percentage =
        set.total > 0 ? (set.completedCount / set.total) * 100 : 0;
      return {
        ...set,
        percentage: percentage,
      };
    });

    const totalPercentage = overAllKpiArray.reduce(
      (acc, set) => acc + set.percentage,
      0
    );

    const averagePercentage =
      overAllKpiArray.length > 0 ? totalPercentage / overAllKpiArray.length : 0;
    const averageScoreOutOf5 = (averagePercentage / 100) * 5;

    return {
      summary: overAllKpiArray,
      averagePercentage: averagePercentage,
      averageScore: averageScoreOutOf5,
    };
  }, [userData]);

  const allScoredSetsRaw = useMemo(() => {
        let rawData: any[] = [];
        const timelines: ('weekly' | 'monthly' | 'yearly')[] = ["weekly", "monthly", "yearly"];

        for (const timeline of timelines) {
            const periodData = userData?.kpiHistory?.[timeline] || [];
            
            for (const period of periodData) {
                const periodStart = new Date(period.periodStart);
                for (const set of period.sets || []) {
                    rawData.push({
                        setId: set.setId,
                        setName: set.setName,
                        points: set.pointsEarned || 0,
                        scoredAt: periodStart,
                        assignedTimeline: set.timeline, 
                    });
                }
            }
        }
        return rawData;
    }, [userData]);


    const chartDataAndRange = useMemo(() => {
        
        // a. Determine the date boundaries for the current offset
        const { startDate, endDate, rangeLabel } = calculateDateRange(timeRange, offset);

        // b. Filter the raw scores by the calculated date window
        const setsInTimeWindow = allScoredSetsRaw.filter((item: any) => {
            const scoredDate = item.scoredAt.getTime();
            return scoredDate >= startDate.getTime() && scoredDate <= endDate.getTime();
        });
        
        let filteredBySetType = setsInTimeWindow;

        if (timeRange === 'monthly' || timeRange === 'quarterly') {
             // Only keep Weekly and Monthly assigned sets for Monthly/Quarterly view
             filteredBySetType = setsInTimeWindow.filter(item => 
                 item.assignedTimeline === KpiTimeline.WEEKLY || item.assignedTimeline === KpiTimeline.MONTHLY
             );
        } else if (timeRange === 'yearly') {
             // Keep all sets for the yearly view
             filteredBySetType = setsInTimeWindow; 
        }

        // d. Aggregate the filtered sets by unique Set ID and calculate average score
        const aggregatedSetScores: Record<string, {
            setName: string;
            totalPoints: number;
            scoreCount: number;
        }> = {};

        for (const item of filteredBySetType) {
            const id = item.setId;

            if (!aggregatedSetScores[id]) {
                aggregatedSetScores[id] = {
                    setName: item.setName,
                    totalPoints: 0,
                    scoreCount: 0,
                };
            }

            aggregatedSetScores[id].totalPoints += item.points;
            aggregatedSetScores[id].scoreCount += 1;
        }

        // e. Final Formatting
        const finalChartData = Object.values(aggregatedSetScores).map((setAggregate) => {
            const averageScore = setAggregate.scoreCount > 0
                ? setAggregate.totalPoints / setAggregate.scoreCount
                : 0;
            
            return {
                setLabel: setAggregate.setName, // X-Axis Bar Label
                score: averageScore,           // Y-Axis Bar Height (0 to 1)
            };
        }).sort((a, b) => a.setLabel.localeCompare(b.setLabel)); // Sort alphabetically for bar chart

        return {
            chartData: finalChartData,
            rangeLabel: rangeLabel,
            totalUniqueSetsScored: Object.keys(aggregatedSetScores).length 
        };

    }, [allScoredSetsRaw, timeRange, offset]);

    // Destructure for easy access
    const { chartData, rangeLabel, totalUniqueSetsScored } = chartDataAndRange;
    const hasData = totalUniqueSetsScored > 0;

    // 3. Carousel Navigation Logic (simplified)
    const handleNav = useCallback((direction: 'prev' | 'next') => {
        setOffset(prev => {
            if (direction === 'prev') {
                return prev + 1; // Increase offset to go backward in time
            } else {
                return Math.max(0, prev - 1); 
            }
        });
    }, []);


  useEffect(() => {
    if (queryError) {
      toast.error(error || "Failed to load user details");
    }
  }, [queryError, error]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 mb-4">User ID is required.</div>
          <Button onClick={() => navigate("/kpi/scoring")}>Back to KPI Scoring</Button>
        </div>
      </div>
    );
  }

  // History carousel helpers
  const getWeekRange = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const daysToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + daysToMonday - offset * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getMonthRange = (offset: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getYearRange = (offset: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear() - offset, 0, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear() - offset, 11, 31);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const formatRange = (
    start: Date,
    end: Date,
    type: "week" | "month" | "year"
  ) => {
    if (type === "week") {
      const s = start.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
      const e = end.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return `${s} - ${e}`;
    }
    if (type === "month")
      return start.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
    return start.getFullYear().toString();
  };

  const getWeekRangeString = (offset: number): string => {
    const { start, end } = getWeekRange(offset);
    const startFormatted = formatToHyphenatedDate(start);
    const endFormatted = formatToHyphenatedDate(end);
    return `${startFormatted} to ${endFormatted}`;
  };

  const getMonthRangeString = (offset: number): string => {
    const { start, end } = getMonthRange(offset);
    const startFormatted = formatToHyphenatedDate(start);
    const endFormatted = formatToHyphenatedDate(end);
    return `${startFormatted} to ${endFormatted}`;
  };

  const getYearRangeString = (offset: number): string => {
    const { start, end } = getYearRange(offset);
    const startFormatted = formatToHyphenatedDate(start);
    const endFormatted = formatToHyphenatedDate(end);
    return `${startFormatted} to ${endFormatted}`;
  };

  const findEntryInRange = (
    entries: any[] | undefined,
    start: Date,
    end: Date
  ) => {
    if (!entries || entries.length === 0) return undefined;
    return entries.find((e: any) => {
      const ps = new Date(e.periodStart);
      const pe = new Date(e.periodEnd);
      return (
        ps.getTime() === start.getTime() ||
        (ps >= start && ps <= end) ||
        (pe >= start && pe <= end)
      );
    });
  };

  // Navigation handlers (offset-based)
  const handleWeeklyNav = (direction: "prev" | "next") => {
    setWeeklyOffset((prev) =>
      direction === "prev" ? prev + 1 : Math.max(0, prev - 1)
    );
  };
  const handleMonthlyNav = (direction: "prev" | "next") => {
    setMonthlyOffset((prev) =>
      direction === "prev" ? prev + 1 : Math.max(0, prev - 1)
    );
  };
  const handleYearlyNav = (direction: "prev" | "next") => {
    setYearlyOffset((prev) =>
      direction === "prev" ? prev + 1 : Math.max(0, prev - 1)
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to KPI Management
          </button>
        </div>
      </div>
    );
  }


  const user = userData?.user;
  const currentXP = user?.currentXP ?? 0;
  const nextLevelXP = user?.nextLevelXP ?? 1;
  const progressPercentage = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;
  const xpToNext = Math.max(0, nextLevelXP - currentXP);

  // Helper function to get next medieval rank
  const getNextMedievalRank = (currentRank: string): string => {
    const ranks = ["Soldier", "Knight", "King", "Emperor", "Legend", "Divine"];
    const currentIndex = ranks.indexOf(currentRank);
    return currentIndex < ranks.length - 1
      ? ranks[currentIndex + 1]
      : currentRank;
  };

  function NormalizeName(user: any): React.ReactNode {
    const capitalizeFirstLetter = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    if (user?.firstName && user?.lastName) {
      return `${capitalizeFirstLetter(
        user.firstName
      )} ${capitalizeFirstLetter(user?.lastName)}`;
    } else if (user?.firstName) {
      return capitalizeFirstLetter(user?.firstName);
    } else if (user?.lastName) {
      return capitalizeFirstLetter(user?.lastName);
    } else {
      return user?.username || user?.workEmail || "Unknown User";
    }
  }

  const formatToHyphenatedDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen bg-primary-50 text-slate-900">
      <div className="p-6">
        {/* User Profile Section */}

        {loading ? <UserProfileHeaderSkeleton /> :
          <>
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                My Performance
              </h1>
              <div className="flex justify-end">
                {showBack? <Button
                  appearance="ghost"
                  onClick={() => {
                    navigate('../kpi/scoring');
                  }}
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="w-full md:w-auto text-slate-500 flex items-center justify-center md:justify-start"
                >
                  Back
                </Button> : <></>}
                
              </div>
            </div>
           <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 shadow-soft border border-slate-200">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              {/* Top section - Avatar and Name */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-base sm:text-lg md:text-xl font-bold text-white flex-shrink-0">
                 {user?.avatar?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                    {NormalizeName(user)}
                  </h1>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                    <span className="bg-gradient-to-r from-primary-600 to-primary-500 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm           text-white font-semibold shadow-soft whitespace-nowrap">
                      {user?.level}
                    </span>
                    <span className="bg-slate-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-slate-700 whitespace-nowrap">
                      Rank #{user?.rank}
                    </span>
                  </div>
                </div>
              </div>
    
                {/* Bottom section - Total Points */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 pl-0 sm:pl-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500 flex-shrink-0" />
                  <span>{user?.totalPoints} Total Points</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-end gap-2 text-sm mb-2 text-slate-600">
                  <span>Progress to {getNextMedievalRank(user?.level ?? "")}:</span>
                  <span>
                    {currentXP}/{nextLevelXP} XP
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {xpToNext} XP to next level
                </div>
              </div>
            </div>
          </>
        }


        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* First Row - Weekly Performance and KPI Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            {/* Weekly Performance - 40% width */}
            <div className="lg:col-span-2 flex">
              {/* Weekly Performance Chart */}

              {loading || fetchingUserDetails ? <SetCompletionTrendSkeleton /> :
                  <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200 flex flex-col w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        Set Completion Trend
                      </h3>
                      <Select
                        value={timeRange}
                        onChange={(value) => {
                          setTimeRange(value as string);
                          setOffset(0); // Reset carousel
                        }}
                        options={[
                          { value: 'monthly', label: 'Monthly' },
                          { value: 'quarterly', label: 'Quarterly' },
                          { value: 'yearly', label: 'Yearly' },
                        ]}
                      />
                    </div>
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="flex-1 min-h-[300px]">
                        {hasData ? (
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                      <YAxis domain={[0, 1]} />
                                      <XAxis 
                                        dataKey="setLabel" 
                                        textAnchor="end"
                                        angle={-30}
                                        height={100} 
                                        style={{ fontSize: '10px' }} 
                                        interval={0} 
                                      />
                                      <Bar dataKey="score" fill="#10B981" barSize={30} />
                                  </BarChart>
                              </ResponsiveContainer>
                          ) : (
                              <div className="flex items-center justify-center h-full">
                                  <div className="text-center text-slate-500">
                                      <p className="text-lg font-medium">No Sets Scored in this Period</p>
                                      <p className="text-sm">Try navigating to a different month or year.</p>
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Carousel Navigation */}
                      <div className="flex items-center justify-center gap-2">
                          <button
                              onClick={() => handleNav("prev")}
                              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                          >
                              <ChevronLeft className="w-4 h-4" /> 
                          </button>

                          <span className="text-sm text-slate-500 whitespace-nowrap">
                              {rangeLabel} 
                          </span>

                          <button
                              onClick={() => handleNav("next")}
                              disabled={offset === 0} 
                              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-50"
                          >
                              <ChevronRight className="w-4 h-4" /> 
                          </button>
                      </div>
                    </div>
                  </div>
              }


            </div>

            {/* Weekly KPI Assessment - 60% width */}
            <div className="lg:col-span-3 flex">
              {/* Weekly KPI Assessment */}
              {loading ? <WeeklyKpiAssessmentSkeleton /> : <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200 flex flex-col w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    {userData?.period || "Weekly"} KPI Assessment
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-600 px-3 py-1 rounded-full text-xs whitespace-nowrap md:text-sm text-white">
                      Avg: {Math.round(weeklySetStats?.averageScore)}/5
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
                  <div className="flex flex-col">
                    {/* Radar Chart */}
                    {weeklySetStats?.summary &&
                      weeklySetStats?.summary.length > 2 ? (
                      <div className="w-full h-[16rem] sm:h-[20rem]">
                        <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={weeklySetStats?.summary}>
                          <PolarGrid stroke="#E5E7EB" />
                          <PolarAngleAxis
                            dataKey="setName"
                            stroke="#6B7280"
                            fontSize={10}
                          />
                          <PolarRadiusAxis
                            stroke="#6B7280"
                            fontSize={10}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                              color: "#374151",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(
                              _value: any,
                              _name: string,
                              props: any
                            ) => {
                              const { completedCount, total, percentage } =
                                props.payload;
                              const formattedPercent =
                                Math.round(percentage * 10) / 10;

                              return [
                                `${formattedPercent}%`,
                                `(${completedCount}/${total} completions)`,
                              ];
                            }}
                            labelFormatter={(label: string) => `Set: ${label}`}
                          />
                          <Radar
                            name="Completion Rate"
                            dataKey="percentage"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-slate-500">
                          <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-lg font-medium">
                            Not Enough Data for Chart
                          </p>
                          <p className="text-sm">
                            A radar chart requires at least 3 sets to be shown.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* KPI Set List */}
                  <div className="space-y-3 flex flex-col justify-flex-start pt-4">
                    {weeklySetStats?.summary &&
                      weeklySetStats?.summary.length > 0 ? (
                      weeklySetStats?.summary.map((set, index) => {
                        const isComplete =
                          set?.total > 0 && set?.completedCount === set?.total;
                        const isStarted = set?.completedCount > 0;

                        const tagColorClasses = isComplete
                          ? "bg-green-100 text-green-700"
                          : isStarted
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-slate-100 text-slate-600";

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {isComplete ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-slate-400" />
                              )}

                              <span className="text-sm text-slate-700">
                                {set.setName || "Unnamed Set"}
                              </span>
                            </div>

                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${tagColorClasses}`}
                            >
                              {`${set?.completedCount}/${set?.total} Scored`}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-slate-500">
                        <Target className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No KPI sets found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>}

            </div>
          </div>

          {/* Second Row - Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            {/* left column */}
            <div className="lg:col-span-2 flex">
              {/* KPI Set List Card */}
              {loading ? <KpiSetListSkeleton /> :
                  <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200 flex flex-col w-full max-h-[600px]">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                      <h3 className="text-lg font-bold text-slate-900">
                        KPI Set List
                      </h3>
                    </div>

                    {weeklySetStats?.summary?.length === 0 && (
                      <div className="text-center text-lg text-slate-500 font-medium p-4">
                        No Data Available
                      </div>
                    )}

                    <div className="gap-2 grid grid-cols-1 lg:grid-cols-2 overflow-y-auto flex-1">
                      {weeklySetStats?.summary.map((set: any, index: number) => (
                        <div
                          key={set?.setId || index}
                          className="bg-white border border-slate-200 rounded-xl p-2 shadow-soft hover:shadow-soft transition-shadow h-fit"
                        >
                          <div className="flex items-center mb-2">
                            <span className="font-semibold text-slate-800">
                              {set?.setName}
                            </span>
                            <SimpleTooltip
                              key={index}
                              label={
                                <div className="text-xs max-w-[200px]">
                                  <p className="font-semibold mb-1 text-justify border-b border-slate-500/30 pb-1">
                                    {set?.setName}
                                  </p>
                                  <p className="text-slate-500 text-justify">
                                    {set?.setDescription}
                                  </p>
                                </div>
                              }
                              side="top"
                            >
                              <span className="flex self-center cursor-pointer flex-shrink-0 ml-2" style={{ marginTop: '4px' }}>
                                <Info size={18} className="w-4 h-4 text-slate-400" />
                              </span>
                            </SimpleTooltip>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-sm text-slate-700">
                            {set?.kpis && set?.kpis.length > 0 ? (
                              set?.kpis.map((kpi: any, kpiIndex: number) => (
                                <li key={kpiIndex} className="truncate flex items-center justify-between group">
                                  <span className="truncate">{kpi?.kpiName || kpi?.name}</span>
                                  <SimpleTooltip
                                    key={kpiIndex}
                                    label={
                                      <div className="text-xs max-w-[200px]">
                                        <p className="font-semibold mb-1 text-justify border-b border-slate-500/30 pb-1">
                                          {kpi?.kpiName || kpi?.name}
                                        </p>
                                        <p className="text-slate-500 text-justify">
                                          {kpi?.kpiDescription || kpi?.description}
                                        </p>
                                      </div>
                                    }
                                    side="top"
                                  >
                                    <span className="flex self-center cursor-pointer flex-shrink-0 ml-2">
                                      <Info size={18} className="w-4 h-4 text-slate-400" />
                                    </span>
                                  </SimpleTooltip>
                                </li>
                              ))
                            ) : (
                              <li>No KPIs assigned in this summary</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
              }

            </div>

            {/* Leaderboard - right column */}
            <div className="lg:col-span-3 flex">
              {/* Weekly Leaderboard */}
              {loading ? <OverallLeaderboardSkeleton /> : <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200 flex flex-col w-full max-h-[600px]">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h3 className="text-lg font-bold text-slate-900">
                    Overall Leaderboard
                  </h3>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 rounded-lg ">
                  {(userData?.leaderboard ?? []).map((person: any, index: number) => {
                      const hasCrown = person?.rank === 1;

                      return (
                        <div
                          key={`${person?.name}-${person?.rank}-${index}`}
                          className={`p-4 rounded-lg flex items-center w-[24rem] sm:w-full gap-4 ${
                            person.isCurrentUser
                              ? "bg-primary-500 text-white"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                person?.isCurrentUser
                                  ? "bg-white text-slate-900"
                                  : "bg-slate-300 text-slate-700"
                              }`}
                            >
                              {person?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2  md:gap-4">
                                <div className="flex flex-col leading-tight">
                                  <span
                                  className={`font-medium text-sm md:text-base whitespace-nowrap ${
                                    person?.isCurrentUser
                                      ? "text-white"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {person?.name}
                                </span>
                                    <span
                                className={`text-xs sm:text-sm whitespace-nowrap ${
                                  person?.isCurrentUser
                                    ? "text-primary-100"
                                    : "text-slate-500"
                                }`}
                              >
                                {person?.department || person?.position || "N/A"}
                              </span>
                                </div>
                                {hasCrown && (
                                  <Crown className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-auto text-right">
                            <div
                              className={`font-semibold text-xs md:text-base whitespace-nowrap ${
                                person?.isCurrentUser
                                  ? "text-white"
                                  : "text-slate-900"
                              }`}
                            >
                              {person?.points} points
                            </div>
                            <div
                              className={`text-xs mt-0.5 whitespace-nowrap ${
                                person?.isCurrentUser
                                  ? "text-primary-100"
                                  : "text-slate-500"
                              }`}
                            >
                              Rank #{person?.rank ?? index + 1}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>}
            </div>
          </div>

          {/* KPI History Section - Three carousels always visible */}
          {loading ? <KpiCompletionHistorySkeleton /> :
            <>
              {userData?.kpiHistory && (
                <div className="mt-6">
                  <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <Award className="w-6 h-6 text-primary-600" />
                      <h3 className="text-sm md:text-xl font-semibold m-0 text-slate-900">
                        KPI Completion History
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6">
                      {/* Weekly History */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 md:w-5 md:h-5 text-primary-600" />
                            <h4 className="text-sm md:text-lg m-0 font-medium text-slate-900">
                              Weekly
                            </h4>
                          </div>
                          <div className="flex items-center gap-0 md:gap-2">
                              <button
                                onClick={() => handleWeeklyNav("prev")}
                                className="p-2 shrink-0 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              <span className="text-xs sm:text-sm font-small text-slate-500 whitespace-nowrap">
                                  {getWeekRangeString(weeklyOffset)}
                              </span>

                              <button
                                onClick={() => handleWeeklyNav("next")}
                                disabled={weeklyOffset === 0}
                                className="p-2 shrink-0 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-50"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                          </div>
                        </div>
                        {(() => {
                          const { start, end } = getWeekRange(weeklyOffset);
                          const rangeLabel = formatRange(start, end, "week");
                          const week = findEntryInRange(
                            userData?.kpiHistory.weekly,
                            start,
                            end
                          );
                          if (!week) {
                            return (
                              <div className="text-xs sm:text-base p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-600">
                                No records for {rangeLabel}
                              </div>
                            );
                          }
                          return (
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {week?.period}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {new Date(
                                      week?.periodStart
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(week?.periodEnd).toLocaleDateString()}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${week?.completionRate >= 80
                                    ? "bg-green-100 text-green-800"
                                    : week?.completionRate >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {week?.completionRate}%
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">
                                {week?.completedSets}/{week?.totalSets} sets completed
                              </div>
                              {week?.sets && week?.sets.length > 0 && (
                                <div className="mt-3 space-y-3">
                                  {week?.sets.map((s: any, i: number) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-white rounded border border-slate-200"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-bold text-slate-900">
                                          {s.setName}
                                        </div>
                                        {s.completed ? (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            Completed
                                          </span>
                                        ) : (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            Not Completed
                                          </span>
                                        )}
                                      </div>
                                      {s.kpis && s.kpis.length > 0 && (
                                        <div className="space-y-1">
                                          {s.kpis.map((k: any, kIdx: number) => (
                                            <div
                                              key={kIdx}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              {k.completed ? (
                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                              ) : (
                                                <Clock className="w-3 h-3 text-slate-400" />
                                              )}
                                              <span
                                                className={
                                                  k.completed
                                                    ? "text-green-700"
                                                    : "text-slate-500"
                                                }
                                              >
                                                {k.kpiName}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div className="mt-2 text-xs text-slate-600">
                                        <span className="font-medium">
                                          Comment:
                                        </span>{" "}
                                        {s.comment || "—"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Monthly History */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 md:w-5 md:h-5 text-green-600" />
                            <h4 className="text-sm sm:text-lg m-0 font-medium text-slate-900">
                              Monthly
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleMonthlyNav("prev")}
                              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="text-xs sm:text-sm font-small text-slate-500 whitespace-nowrap">
                                {getMonthRangeString(monthlyOffset)}
                            </span>

                            <button
                              onClick={() => handleMonthlyNav("next")}
                              disabled={monthlyOffset === 0}
                              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-50"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {(() => {
                          const { start, end } = getMonthRange(monthlyOffset);
                          const rangeLabel = formatRange(start, end, "month");
                          const month = findEntryInRange(
                            userData?.kpiHistory.monthly,
                            start,
                            end
                          );
                          if (!month) {
                            return (
                              <div className="text-xs sm:text-base p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-600">
                                No records for {rangeLabel}
                              </div>
                            );
                          }
                          return (
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {month?.period}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {new Date(
                                      month?.periodStart
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(month?.periodEnd).toLocaleDateString()}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${month?.completionRate >= 80
                                    ? "bg-green-100 text-green-800"
                                    : month?.completionRate >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {month?.completionRate}%
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">
                                {month?.completedSets}/{month?.totalSets} sets
                                completed
                              </div>
                              {month?.sets && month?.sets.length > 0 && (
                                <div className="mt-3 space-y-3">
                                  {month?.sets.map((s: any, i: number) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-white rounded border border-slate-200"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-bold text-slate-900">
                                          {s.setName}
                                        </div>
                                        {s.completed ? (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            Completed
                                          </span>
                                        ) : (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            Not Completed
                                          </span>
                                        )}
                                      </div>
                                      {s.kpis && s.kpis.length > 0 && (
                                        <div className="space-y-1">
                                          {s.kpis.map((k: any, kIdx: number) => (
                                            <div
                                              key={kIdx}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              {k.completed ? (
                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                              ) : (
                                                <Clock className="w-3 h-3 text-slate-400" />
                                              )}
                                              <span
                                                className={
                                                  k.completed
                                                    ? "text-green-700"
                                                    : "text-slate-500"
                                                }
                                              >
                                                {k.kpiName}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div className="mt-2 text-xs text-slate-600">
                                        <span className="font-medium">
                                          Comment:
                                        </span>{" "}
                                        {s.comment || "—"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 md:w-5 md:h-5 text-indigo-600" />
                            <h4 className="text-sm sm:text-lg m-0 font-medium text-slate-900">
                              Yearly
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleYearlyNav("prev")}
                              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="text-xs sm:text-sm font-small text-slate-500 whitespace-nowrap">
                                {getYearRangeString(yearlyOffset)}
                            </span>

                            <button
                              onClick={() => handleYearlyNav("next")}
                              disabled={yearlyOffset === 0}
                              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-50"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {(() => {
                          const { start, end } = getYearRange(yearlyOffset);
                          const rangeLabel = formatRange(start, end, "year");
                          const year = findEntryInRange(
                            userData?.kpiHistory?.yearly,
                            start,
                            end
                          );
                          if (!year) {
                            return (
                              <div className="text-xs sm:text-base p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-600">
                                No records for {rangeLabel}
                              </div>
                            );
                          }
                          return (
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {year.period}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {new Date(
                                      year?.periodStart
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(year?.periodEnd).toLocaleDateString()}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${year?.completionRate >= 80
                                    ? "bg-green-100 text-green-800"
                                    : year?.completionRate >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {year?.completionRate}%
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">
                                {year?.completedSets}/{year?.totalSets} sets completed
                              </div>
                              {year.sets && year.sets.length > 0 && (
                                <div className="mt-3 space-y-3">
                                  {year.sets.map((s: any, i: number) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-white rounded border border-slate-200"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-bold text-slate-900">
                                          {s.setName}
                                        </div>
                                        {s.completed ? (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            Completed
                                          </span>
                                        ) : (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            Not Completed
                                          </span>
                                        )}
                                      </div>
                                      {s.kpis && s.kpis.length > 0 && (
                                        <div className="space-y-1">
                                          {s.kpis.map((k: any, kIdx: number) => (
                                            <div
                                              key={kIdx}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              {k.completed ? (
                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                              ) : (
                                                <Clock className="w-3 h-3 text-slate-400" />
                                              )}
                                              <span
                                                className={
                                                  k.completed
                                                    ? "text-green-700"
                                                    : "text-slate-500"
                                                }
                                              >
                                                {k.kpiName}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div className="mt-2 text-xs text-slate-600">
                                        <span className="font-medium">
                                          Comment:
                                        </span>{" "}
                                        {s.comment || "—"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          }

        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
