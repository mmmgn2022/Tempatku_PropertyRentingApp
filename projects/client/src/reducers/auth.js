import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    name: "", 
    email: "",
    role: "",
    isVerified: "",
    image_profile: "",
    birth: "",
    gender: "",
    password: "",
  },

  reducers: {
    loginAction: (state, action) => {
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.isVerified = action.payload.isVerified;
        state.image_profile = action.payload.image_profile;
        state.birth = action.payload.birth;
        state.gender = action.payload.gender;
    },
    logoutAction: (state) => {
        state.name = "";
        state.email = "";
        state.role = "";
        state.image_profile = "";
        state.isVerified = "";
        state.birth = "";
        state.gender = "";
        state.password= "";
    },
    loginActionGoogle: (state, action) => {
      const { getuser } = action.payload;
      state.name = getuser[0].user_detail.name;
      state.email = getuser[0].email;
      state.role = getuser[0].role.role;
      state.isVerified = getuser[0].isVerified;
      state.image_profile = getuser[0].user_detail.image_profile;
      state.birth = getuser[0].user_detail.birth;
      state.gender = getuser[0].user_detail.gender;
      state.password = getuser[0].password;
    },
});

export const {loginAction, logoutAction, loginActionGoogle} = authSlice.actions;

export default authSlice.reducer;
