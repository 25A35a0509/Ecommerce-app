import { useDispatch, useSelector } from 'react-redux';

// Thin re-exports so components import from a single consistent location
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
