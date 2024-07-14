import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CacheState {
    [key: string]: {
        value: string;
        expiry: string;
    };
}

const initialState: CacheState = {};

export const cacheSlice = createSlice({
    name: "cache",
    initialState,
    reducers: {
        setItem: (
            state,
            action: PayloadAction<{ key: string; value: any; expiry: string }>
        ) => {
            const { key, value, expiry } = action.payload;
            state[key] = { value, expiry };
        },
        deleteItem: (state, action: PayloadAction<{ key: string }>) => {
            delete state[action.payload.key];
        },
        setCache: (
            state,
            action: PayloadAction<{
                [key: string]: { value: any; expiry: string };
            }>
        ) => {
            Object.entries(action.payload).forEach(([key, value]) => {
                state[key] = {
                    value: value.value,
                    expiry: value.expiry,
                };
            });
        },
    },
});

export const { setItem, deleteItem, setCache } = cacheSlice.actions;

export default cacheSlice.reducer;
