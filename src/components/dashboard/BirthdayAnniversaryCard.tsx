import React, { useState } from "react";
import { Cake, Calendar, Gift, Mail, User2 } from "lucide-react";
import { useGetCelebrationsQuery, IBirthdayItem, IAnniversaryItem } from "../../store/apis/user.api";
import WishModal from "./WishModal";

const BirthdayAnniversaryCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"birthdays" | "anniversaries">("birthdays");
  const { data, isLoading: loading } = useGetCelebrationsQuery();
  const birthdays = data?.birthdays ?? [];
  const anniversaries = data?.anniversaries ?? [];

  const [wishModal, setWishModal] = useState<{
    open: boolean;
    type: "birthday" | "anniversary";
    targetUserId: string;
    targetName: string;
  }>({ open: false, type: "birthday", targetUserId: "", targetName: "" });

  const openWish = (
    type: "birthday" | "anniversary",
    item: IBirthdayItem | IAnniversaryItem
  ) => {
    setWishModal({
      open: true,
      type,
      targetUserId: item.userId,
      targetName: item.name || "Employee",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="">
        <div className="flex gap-4 xl:gap-6 mb-4">
          <div
            onClick={() => setActiveTab('birthdays')}
            className={`cursor-pointer flex items-center justify-center space-x-1 sm:space-x-2 pb-2 transition-all duration-200 ${
              activeTab === 'birthdays'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Cake className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold">Birthdays</span>
            <span className="text-xs font-medium">
              ({birthdays.length})
            </span>
          </div>
          
          <div
            onClick={() => setActiveTab('anniversaries')}
            className={`cursor-pointer flex items-center space-x-1 sm:space-x-2 pb-2 transition-all duration-200 ${
              activeTab === 'anniversaries'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold">Anniversaries</span>
            <span className="text-xs font-medium">
              ({anniversaries.length})
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="flex flex-col flex-1 space-y-3 h-full">
          {activeTab === 'birthdays' ? (
            birthdays.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-8 h-full">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Cake className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm mb-2">No birthdays today</p>
              </div>
            ) : (
              birthdays.map((item) => (
                <div
                  key={`b-${item.workEmail}`}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-100">
                      <Cake className="w-5 h-5 text-pink-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start flex-col gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate mb-0">
                          {item.name || "—"}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                            Today
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <p className="text-xs text-slate-500 truncate mb-0">
                          <span className="flex items-center gap-1"><User2 className="w-4 h-4 mb-1"/>
                          {item.employeeId || '—'}</span></p>
                        <p className="text-xs text-slate-500 truncate mb-0">•</p>
                        <p className="text-xs text-slate-500 truncate mb-0">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>
                          {item.workEmail}
                        </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => openWish("birthday", item)}
                      className="p-2 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 transition-colors"
                    >
                      <Gift className="w-4 h-4 animate-soft-bounce" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            anniversaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 w-full flex-1 h-full">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm mb-2">No anniversaries today</p>
              </div>
            ) : (
              anniversaries.map((item) => (
                <div
                  key={`a-${item.workEmail}`}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start flex-col gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate mb-0">
                          {item.name || "—"}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                            {item.yearsOfService} Year{item.yearsOfService > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <p className="text-xs text-slate-500 truncate mb-0">
                          <span className="flex items-center gap-1"><User2 className="w-4 h-4 mb-1"/>
                          {item.employeeId || '—'}</span></p>
                        <p className="text-xs text-slate-500 truncate mb-0">•</p>
                        <p className="text-xs text-slate-500 truncate mb-0">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>
                          {item.workEmail}
                        </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => openWish("anniversary", item)}
                      className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                    >
                      <Gift className="w-4 h-4 animate-soft-bounce" />
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      <WishModal
        isOpen={wishModal.open}
        onClose={() => setWishModal((prev) => ({ ...prev, open: false }))}
        type={wishModal.type}
        targetUserId={wishModal.targetUserId}
        targetName={wishModal.targetName}
      />
    </div>
  );
};

export default BirthdayAnniversaryCard;
