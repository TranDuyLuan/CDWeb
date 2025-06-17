package com.phegondev.Phegon.Eccormerce.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
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
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.web.client.RestTemplate;


import java.util.*;
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
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("Email not found"));

        String newPassword = generateStrongPassword(10);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        emailService.sendSimpleMessage(
                user.getEmail(),
                "Yêu cầu đặt lại mật khẩu",
                "Mật khẩu tạm thời của bạn là: " + newPassword
        );

        return Response.builder()
                .status(200)
                .message("New password sent to your email")
                .build();
    }

    @Override
    public Response updateUserProfile(UpdateUserProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEmail(request.getEmail()); // Nếu cho phép đổi email

        userRepo.save(user);

        return Response.builder()
                .status(200)
                .message("Cập nhật thông tin thành công")
                .user(entityDtoMapper.mapUserToDtoBasic(user))
                .build();

    }
    @Override
    public Response loginWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    JacksonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList("975530860641-264sfp01t88u8vkhdva2kh19aocdokge.apps.googleusercontent.com"))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("ID Token không hợp lệ");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userRepo.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .email(email)
                        .name(name)
                        .phoneNumber("+84")
                        .role(UserRole.USER)
                        .password(passwordEncoder.encode("google_login_dummy_password"))
                        .build();
                return userRepo.save(newUser);
            });

            String jwtToken = jwtUtils.generateToken(user);

            return Response.builder()
                    .status(200)
                    .message("Google login thành công")
                    .token(jwtToken)
                    .role(user.getRole().name())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Google login thất bại: " + e.getMessage());
        }
    }

    @Override
    public Response loginWithFacebook(String accessToken) {
        try {
            String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + accessToken;

            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> fbUser = restTemplate.getForObject(url, Map.class);

            // ✅ In log để kiểm tra dữ liệu trả về
            System.out.println("== Facebook user response ==");
            System.out.println(fbUser);

            if (fbUser == null) {
                throw new RuntimeException("Không nhận được phản hồi từ Facebook.");
            }

            String email = (String) fbUser.get("email");
            String name = (String) fbUser.get("name");

            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Không lấy được email từ Facebook. Có thể người dùng chưa cấp quyền email.");
            }

            User user = userRepo.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .email(email)
                        .name(name != null ? name : "Facebook User")
                        .phoneNumber("+84")
                        .role(UserRole.USER)
                        .password(passwordEncoder.encode("facebook_login"))
                        .build();
                return userRepo.save(newUser);
            });

            String jwtToken = jwtUtils.generateToken(user);

            return Response.builder()
                    .status(200)
                    .message("Login Facebook thành công")
                    .token(jwtToken)
                    .role(user.getRole().name())
                    .build();
        } catch (Exception e) {
            // ✅ Log lỗi rõ ràng
            e.printStackTrace();
            throw new RuntimeException("Facebook login thất bại: " + e.getMessage());
        }

    }
    private String generateStrongPassword(int length) {
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String digits = "0123456789";
        String symbols = "!@#$%^&*";
        String all = lower + upper + digits + symbols;

        Random random = new Random();
        StringBuilder password = new StringBuilder();

        password.append(lower.charAt(random.nextInt(lower.length())));
        password.append(upper.charAt(random.nextInt(upper.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(symbols.charAt(random.nextInt(symbols.length())));

        for (int i = 4; i < length; i++) {
            password.append(all.charAt(random.nextInt(all.length())));
        }

        List<Character> chars = password.chars().mapToObj(c -> (char) c).collect(Collectors.toList());
        Collections.shuffle(chars);

        StringBuilder shuffled = new StringBuilder();
        chars.forEach(shuffled::append);

        return shuffled.toString();
    }







}
