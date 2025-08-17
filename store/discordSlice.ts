import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
interface DiscordType {
  id: string;
  name: string;
  instant_invite: string;
  channels: any[];
  members: Member[];
  presence_count: number;
}

export interface Member {
  id: string;
  username: string;
  discriminator: string;
  avatar: null;
  status: string;
  avatar_url: string;
  game?: Game;
}

interface Game {
  name: string;
}
interface DiscordState {
  data: DiscordType | null;
  loading: boolean;
  error: string | null;
}

const initialState: DiscordState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDiscordData = createAsyncThunk(
  "discord/fetchData",
  async (endpoint: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://discord.com/api/${endpoint}`, {});
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      // 随机
      data.members = data.members.sort(() => Math.random() - 0.5).slice(0, 20);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const discordSlice = createSlice({
  name: "discord",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscordData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscordData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDiscordData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default discordSlice.reducer;
