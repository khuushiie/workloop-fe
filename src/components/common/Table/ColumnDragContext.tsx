import React, { createContext, useContext } from 'react';

interface ColumnDragContextType {
  /** The unique key of the column currently being dragged */
  activeId: string | null;
}

const ColumnDragContext = createContext<ColumnDragContextType>({
  activeId: null,
});

export const ColumnDragProvider: React.FC<{ 
  value: ColumnDragContextType; 
  children: React.ReactNode 
}> = ({ value, children }) => (
  <ColumnDragContext.Provider value={value}>
    {children}
  </ColumnDragContext.Provider>
);

export const useColumnDrag = () => useContext(ColumnDragContext);
