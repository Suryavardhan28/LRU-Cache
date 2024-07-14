// store.ts
import { configureStore } from "@reduxjs/toolkit";
import loggerMiddleware from "../../middleware/logger";
import cacheReducer from "../slices/cacheSlice";
import store from "../store";

export default configureStore({
    reducer: {
        cache: cacheReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
