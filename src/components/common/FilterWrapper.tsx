import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import React, { useState } from 'react'


function FilterWrapper({ children }: { children: React.ReactNode }) {

    const [showFilters, setShowFilters] = useState(false);

    return (

    <div className='bg-white w-full rounded-xl text-left shadow-soft border transition-all duration-300 border-slate-200 mb-6'>
        <button
         onClick={() => setShowFilters(!showFilters)}
         className={`bg-white w-full ${showFilters? 'rounded-t-xl' : 'rounded-xl'} text-left shadow-soft border border-slate-200 transition-all duration-300`}>
            <div className="p-4 border-b border-slate-200 flex justify-between">
              <span
                className="flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </span>
              {/* DropDown Icon */}
              <span>
                {showFilters? (<ChevronUp className="w-5 h-5 transition-transform duration-300"/>) : (<ChevronDown className="w-5 h-5 transition-transform duration-300"/>)}
              </span>
            </div>
        </button>
        {showFilters && 
          <div className="p-4">
            {children}
          </div>
        }
    </div>
  );
}

export default FilterWrapper;