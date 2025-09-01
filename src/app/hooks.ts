import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import type { TypedUseSelectorHook } from 'react-redux';

// 타입이 지정된 useDispatch와 useSelector 훅들
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
