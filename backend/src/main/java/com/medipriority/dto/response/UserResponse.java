package com.medipriority.dto.response;

import com.medipriority.model.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long userId,
        String fullName,
        String email,
        User.Role role,
        boolean active,
        LocalDateTime createdAt
) {}
