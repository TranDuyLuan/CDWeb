package com.phegondev.Phegon.Eccormerce.controller;


import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.UpdateUserProfileRequest;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping("/get-all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/my-info")
    public ResponseEntity<Response> getUserInfoAndOrderHistory(){
        return ResponseEntity.ok(userService.getUserInfoAndOrderHistory());
    }
    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateUserProfileRequest request) {
        Response response = userService.updateUserProfile(request);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
    }




}
