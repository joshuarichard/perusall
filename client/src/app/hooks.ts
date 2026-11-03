import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Pre-typed hooks so components don't need to import RootState/AppDispatch everywhere.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
