package com.phegondev.Phegon.Eccormerce.dto;
import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String name;
    private String email;
    private String phoneNumber;
}
