import { useLocation } from "react-router-dom";
import {
  useLoginMutation,
  useChangePasswordMutation,
  useMarkFirstLoginCompleteMutation,
  useLogoutMutation,
  useGetMeQuery,
} from "../apis/auth.api";
import { useAppSelector } from "../hooks";
import { RootState } from "../index";

export const useAuth = () => {
  const { pathname } = useLocation();
  const { user, token, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth
  );

  const isLoginPage = pathname === "/login";
  const shouldFetchMe = !!token && !isLoginPage;
  const { isLoading: getMeLoading, isUninitialized: getMeUninitialized } =
    useGetMeQuery(undefined, { skip: !shouldFetchMe });

  const isLoading =
    shouldFetchMe && (getMeLoading || getMeUninitialized);

  const [loginMutation, loginState] = useLoginMutation();
  const [changePasswordMutation, changePasswordState] = useChangePasswordMutation();
  const [markFirstLoginCompleteMutation, markFirstLoginCompleteState] = useMarkFirstLoginCompleteMutation();
  const [logoutMutation, logoutState] = useLogoutMutation();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,

    // Grouped by operation
    login: {
      mutate: loginMutation,
      isLoading: loginState.isLoading,
      isSuccess: loginState.isSuccess,
      isError: loginState.isError,
      error: loginState.error,
      reset: loginState.reset, // RTK Query provides this
    },
    
    changePassword: {
      mutate: changePasswordMutation,
      isLoading: changePasswordState.isLoading,
      isSuccess: changePasswordState.isSuccess,
      isError: changePasswordState.isError,
      error: changePasswordState.error,
      reset: changePasswordState.reset,
    },
    
    markFirstLoginComplete: {
      mutate: markFirstLoginCompleteMutation,
      isLoading: markFirstLoginCompleteState.isLoading,
      isSuccess: markFirstLoginCompleteState.isSuccess,
    },
    
    logout: {
      mutate: logoutMutation,
      isLoading: logoutState.isLoading,
    }
  };
};
