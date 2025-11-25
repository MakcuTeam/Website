import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
interface DiscordType {
  id: string;
  name: string;
  instant_invite: string;
  channels: any[];
  members: Member[];
  presence_count: number;
  member_count?: number;
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
      // Limit members to 200 to save bandwidth (we need 72 for display: 8 rows x 9 columns)
      // This ensures we have enough unique members for randomization while keeping data transfer minimal
      if (data.members && Array.isArray(data.members)) {
        data.members = data.members.slice(0, 200);
      }

      const inviteCode = data.instant_invite?.split("/").pop();
      if (inviteCode) {
        const inviteRes = await fetch(
          `https://discord.com/api/invites/${inviteCode}?with_counts=true`
        );
        if (inviteRes.ok) {
          const inviteData = await inviteRes.json();
          data.member_count =
            inviteData.approximate_member_count ?? inviteData.member_count;
        }
      }
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
