import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../store/store';
import { login, logout, fetchCurrentUser } from '../features/auth/authSlice';
import { useEffect } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // console.log( user, token, isAuthenticated, isLoading);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    if (token && !user && !isLoading) {
      dispatch(fetchCurrentUser() as any);
    }
  }, [dispatch, token, user, isLoading]);

  const loginUser = async (email: string, password: string) => {
    try {
      const result = await dispatch(login({ email, password }) as any);
      
      // Check if login was successful
      if (login.fulfilled.match(result)) {
        router.push('/dashboard');
        return true;
      } else {
        // Login failed
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const logoutUser = async () => {
    await dispatch(logout() as any);
    router.push('/login');
  };

  const checkIsAdmin = () => {
    return user?.role.includes('admin') || false;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: loginUser,
    logout: logoutUser,
    checkIsAdmin,
  };
};

export default useAuth;