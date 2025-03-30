'use client';
import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

const Context = createContext<{
  accounts: string[];
  setAccounts: React.Dispatch<React.SetStateAction<never[]>>;
}>({ accounts: [], setAccounts: () => {} });

const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState([]);

  const value = useMemo(() => ({ accounts, setAccounts }), [accounts]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default StateProvider;

export const useStateContext = () => useContext(Context);
