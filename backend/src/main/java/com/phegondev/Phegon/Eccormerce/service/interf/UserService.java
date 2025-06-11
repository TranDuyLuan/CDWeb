package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.*;
import com.phegondev.Phegon.Eccormerce.entity.User;

public interface UserService {
    Response registerUser(UserDto registrationRequest);
    Response loginUser(LoginRequest loginRequest);
    Response getAllUsers();
    User getLoginUser();
    Response getUserInfoAndOrderHistory();
    Response changePassword(ChangePasswordRequest request);
    Response handleForgotPassword(ForgotPasswordRequest request);
    Response updateUserProfile(UpdateUserProfileRequest request);
    Response loginWithGoogle(String idToken);


}
