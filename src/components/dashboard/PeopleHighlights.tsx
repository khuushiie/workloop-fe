import React from "react";
import RecentJoinersCard from "./RecentJoinersCard";
import BirthdayAnniversaryCard from "./BirthdayAnniversaryCard";

const PeopleHighlights: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <RecentJoinersCard />
      </div>
      <div>
        <BirthdayAnniversaryCard />
      </div>
    </div>
  );
};

export default PeopleHighlights;


