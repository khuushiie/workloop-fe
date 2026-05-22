import { LucideIcon } from 'lucide-react';

export interface StatCardConfig {
    key: string;
    label: string;
    color: string;
    icon: LucideIcon;
    suffix?: string;
}

interface StatsCardsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stats: Record<string, any> | null;
    cards: StatCardConfig[];
    loading?: boolean;
    gridCols?: string;
}

function StatsCards({
    stats,
    cards,
    loading = false,
    gridCols = 'xl:grid-cols-4',
}: StatsCardsProps) {
    const getValue = (key: string): string | number => {
        if (!stats) return 0;
        const value = stats[key];
        if (typeof value === 'number') {
            // Format completion rate type values
            if (key.toLowerCase().includes('rate')) {
                return value.toFixed(1);
            }
            return value;
        }
        return value ?? 0;
    };

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4 sm:gap-6`}>
            {cards.map((card) => {
                const Icon = card.icon;
                const value = getValue(card.key);

                return (
                    <div
                        key={card.key}
                        className="bg-white rounded-xl shadow-soft border border-slate-200 p-4 sm:p-5 lg:p-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between h-full">
                            {/* Left Text */}
                            <div className="flex-1 min-w-0 mb-3 sm:mb-0 pr-2">
                                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2 leading-tight">
                                    {card.label}
                                </p>
                                {loading ? (
                                    <div className="h-8 sm:h-10 lg:h-12 w-16 bg-slate-200 rounded animate-pulse" />
                                ) : (
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                                        {value}
                                        {card.suffix && (
                                            <span className="text-lg sm:text-xl lg:text-2xl text-slate-500 ml-0.5">
                                                {card.suffix}
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* Icon */}
                            <div
                                className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0`}
                            >
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default StatsCards;
