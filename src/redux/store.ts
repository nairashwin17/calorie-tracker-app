import { configureStore } from '@reduxjs/toolkit';
import trackerReducer from './trackerSlice';

// Load from local storage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('calorieTrackerState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

// Save to local storage
const saveState = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('calorieTrackerState', serializedState);
    } catch {
        // ignore write errors
    }
};

const preloadedState = loadState();

export const store = configureStore({
    reducer: {
        tracker: trackerReducer,
    },
    preloadedState
});

store.subscribe(() => {
    saveState({
        tracker: store.getState().tracker
    });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
