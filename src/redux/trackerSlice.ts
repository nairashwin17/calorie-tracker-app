import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FoodEntry {
    id: string;
    mealType: string;
    name: string; // Display name
    quantity: number; // or string if we want to keep raw input? Let's use string for display, number for logic? The AI returns number.
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    timestamp: string;
}

export interface TrackerState {
    dailyLogs: Record<string, Record<string, FoodEntry[]>>; // date -> mealType -> items
    currentDate: string;
    editingItem: { date: string; mealType: string; index: number; data: FoodEntry } | null;
    loading: boolean;
    error: string | null;
}

const initialState: TrackerState = {
    dailyLogs: {},
    currentDate: new Date().toISOString().split('T')[0],
    editingItem: null,
    loading: false,
    error: null,
};

const trackerSlice = createSlice({
    name: 'tracker',
    initialState,
    reducers: {
        setCurrentDate: (state, action: PayloadAction<string>) => {
            state.currentDate = action.payload;
        },
        addFoodEntry: (state, action: PayloadAction<{ date: string; mealType: string; foodItem: FoodEntry }>) => {
            const { date, mealType, foodItem } = action.payload;
            if (!state.dailyLogs[date]) {
                state.dailyLogs[date] = {};
            }
            if (!state.dailyLogs[date][mealType]) {
                state.dailyLogs[date][mealType] = [];
            }
            state.dailyLogs[date][mealType].push(foodItem);
        },
        // Batch add
        addBatchFoodEntries: (state, action: PayloadAction<{ date: string; mealType: string; foodItems: FoodEntry[] }>) => {
            const { date, mealType, foodItems } = action.payload;
            if (!state.dailyLogs[date]) {
                state.dailyLogs[date] = {};
            }
            if (!state.dailyLogs[date][mealType]) {
                state.dailyLogs[date][mealType] = [];
            }
            state.dailyLogs[date][mealType].push(...foodItems);
        },
        updateFoodEntry: (state, action: PayloadAction<{ date: string; mealType: string; index: number; foodItem: FoodEntry }>) => {
            const { date, mealType, index, foodItem } = action.payload;
            if (state.dailyLogs[date] && state.dailyLogs[date][mealType]) {
                state.dailyLogs[date][mealType][index] = foodItem;
            }
        },
        deleteFoodEntry: (state, action: PayloadAction<{ date: string; mealType: string; index: number }>) => {
            const { date, mealType, index } = action.payload;
            if (state.dailyLogs[date] && state.dailyLogs[date][mealType]) {
                state.dailyLogs[date][mealType].splice(index, 1);
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setEditingItem: (state, action: PayloadAction<TrackerState['editingItem']>) => {
            state.editingItem = action.payload;
        }
    },
});

export const { setCurrentDate, addFoodEntry, addBatchFoodEntries, updateFoodEntry, deleteFoodEntry, setLoading, setError, setEditingItem } = trackerSlice.actions;
export default trackerSlice.reducer;
