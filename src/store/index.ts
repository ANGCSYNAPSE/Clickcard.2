import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import registrationReducer from "./slices/registrationSlice";
import profileReducer from "./slices/profileSlice";
import shareReducer from "./slices/shareSlice";
import billingReducer from "./slices/billingSlice";
import notificationReducer from "./slices/notificationSlice";
import analyticsReducer from "./slices/analyticsSlice";
import uiReducer from "./slices/uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      registration: registrationReducer,
      profile: profileReducer,
      share: shareReducer,
      billing: billingReducer,
      notifications: notificationReducer,
      analytics: analyticsReducer,
      ui: uiReducer,
    },
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: {
          // FormData / File payloads in profile save thunk are non-serializable by design
          ignoredActionPaths: ["meta.arg.picture"],
        },
      }),
  });

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
