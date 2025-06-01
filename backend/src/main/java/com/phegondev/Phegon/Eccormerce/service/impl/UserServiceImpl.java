package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.*;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.enums.UserRole;
import com.phegondev.Phegon.Eccormerce.exception.InvalidCredentialsException;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import com.phegondev.Phegon.Eccormerce.security.JwtUtils;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {


    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EntityDtoMapper entityDtoMapper;
    private final EmailService emailService;



    @Override
    public Response registerUser(UserDto registrationRequest) {
        // Kiểm tra nếu email đã tồn tại trong cơ sở dữ liệu
        if (userRepo.existsByEmail(registrationRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        UserRole role = UserRole.USER;

        if (registrationRequest.getRole() != null && registrationRequest.getRole().equalsIgnoreCase("admin")) {
            role = UserRole.ADMIN;
        }

        User user = User.builder()
                .name(registrationRequest.getName())
                .email(registrationRequest.getEmail())
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .phoneNumber(registrationRequest.getPhoneNumber())
                .role(role)
                .build();

        User savedUser = userRepo.save(user);
        System.out.println(savedUser);

        UserDto userDto = entityDtoMapper.mapUserToDtoBasic(savedUser);
        return Response.builder()
                .status(200)
                .message("User Successfully Added")
                .user(userDto)
                .build();
    }



    @Override
    public Response loginUser(LoginRequest loginRequest) {

        User user = userRepo.findByEmail(loginRequest.getEmail()).orElseThrow(()-> new NotFoundException("Email not found"));
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
            throw new InvalidCredentialsException("Password does not match");
        }
        String token = jwtUtils.generateToken(user);

        return Response.builder()
                .status(200)
                .message("User Successfully Logged In")
                .token(token)
                .expirationTime("6 Month")
                .role(user.getRole().name())
                .build();
    }

    @Override
    public Response getAllUsers() {

        List<User> users = userRepo.findAll();
        List<UserDto> userDtos = users.stream()
                .map(entityDtoMapper::mapUserToDtoBasic)
                .toList();

        return Response.builder()
                .status(200)
                .userList(userDtos)
                .build();
    }

    @Override
    public User getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String  email = authentication.getName();
        log.info("User Email is: " + email);
        return userRepo.findByEmail(email)
                .orElseThrow(()-> new UsernameNotFoundException("User Not found"));
    }

    @Override
    public Response getUserInfoAndOrderHistory() {
        User user = getLoginUser();
        UserDto userDto = entityDtoMapper.mapUserToDtoPlusAddressAndOrderHistory(user);

        return Response.builder()
                .status(200)
                .user(userDto)
                .build();
    }
    @Override
    public Response changePassword(ChangePasswordRequest request) {
        User user = getLoginUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Mật khẩu hiện tại không chính xác");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        return Response.builder()
                .status(200)
                .message("Mật khẩu đã được thay đổi thành công")
                .build();
    }

    @Override
    public Response handleForgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepo.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new NotFoundException("Email not found");
        }

        User user = userOpt.get();
        String newPassword = "123456"; // Bạn có thể random hoặc gửi link token nếu cần
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        // TODO: Gửi email thực tế
        emailService.sendSimpleMessage(
                user.getEmail(),
                "Yêu cầu đặt lại mật khẩu",
                "Mật khẩu tạm thời của bạn là: " + newPassword
        );
        log.info("New password for {}: {}", user.getEmail(), newPassword);

        return Response.builder()
                .status(200)
                .message("New password sent to your email")
                .build();
    }

}
