import { createReducer } from "@reduxjs/toolkit";
import initialState from "./auth.state";
import authActions from "./auth.action";


const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(authActions.login, (state, action) => {
        const { phone, password } = action.payload;
        if (phone === "1234567890" && password === "password") {
            state.isAuthenticated = true;
            state.user = { 
                id: "1",
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "1234567890",
                avatar: "https://example.com/avatar.jpg",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            state.status = "success";
            state.error = null;
        } else {
            state.isAuthenticated = false;
            state.user = null;
            state.status = "failed";
            state.error = "Invalid phone or password";
        }
        return state;
    })
    .addCase(authActions.logout, (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
    })
});

export { authReducer };
