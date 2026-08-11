import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  notificationService,
  AppNotification,
} from "@/services/notificationService";
import { extractError } from "@/lib/axiosClient";
import type { RequestStatus } from "@/types";

interface NotificationState {
  items: AppNotification[];
  unread: number;
  status: RequestStatus;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unread: 0,
  status: "idle",
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await notificationService.list();
      return data.data ?? { items: [], unread: 0 };
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const markRead = createAsyncThunk(
  "notifications/markRead",
  async (id: number, { rejectWithValue }) => {
    try {
      await notificationService.markRead(id);
      return id;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead();
      return true;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    /** A live notification arrived over the socket. */
    receiveNotification: (state, action: PayloadAction<AppNotification>) => {
      // Avoid duplicates (broadcast emit + fetch race).
      if (!state.items.some((n) => n.id === action.payload.id)) {
        state.items.unshift(action.payload);
        if (!action.payload.is_read) state.unread += 1;
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifications.pending, (s) => {
      s.status = "loading";
    })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.items = a.payload.items;
        s.unread = a.payload.unread;
      })
      .addCase(fetchNotifications.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(markRead.fulfilled, (s, a) => {
        const n = s.items.find((x) => x.id === a.payload);
        if (n && !n.is_read) {
          n.is_read = true;
          s.unread = Math.max(0, s.unread - 1);
        }
      })
      .addCase(markAllRead.fulfilled, (s) => {
        s.items.forEach((n) => (n.is_read = true));
        s.unread = 0;
      });
  },
});

export const { receiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
