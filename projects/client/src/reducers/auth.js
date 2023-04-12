import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    name: "", 
    email: "",
    roleId: "",
    isVerified: "",
    image_profile: "https://ionicframework.com/docs/img/demos/avatar.svg",
    birth: "",
    gender: "",
  },

  reducers: {
    loginAction: (state, action) => {
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.roleId = action.payload.roleId;
        state.isVerified = action.payload.isVerified;
        state.image_profile = action.payload.image_profile;
        state.birth = action.payload.birth;
        state.gender = action.payload.gender;
        console.log("Data roleId dari reducer :", state.roleId);
        console.log("Data isVerified dari reducer :", state.isVerified);
        console.log("Data image_profile dari reducer :", state.image_profile);
        console.log("Data birth dari reducer :", state.birth);
        console.log("Data gender dari reducer :", state.gender);
        console.log("Data name dari reducer :", state.name);
    },
    logoutAction: (state) => {
        state.name = "";
        state.email = "";
        state.roleId = "";
        state.image_profile = "https://ionicframework.com/docs/img/demos/avatar.svg";
        console.log("Data roleId dari reducer logoutaction :", state.roleId);
        console.log("Data image_profile dari reducer logoutaction :", state.image_profile);
    },
  },
});

export const {loginAction, logoutAction} = authSlice.actions;

export default authSlice.reducer;