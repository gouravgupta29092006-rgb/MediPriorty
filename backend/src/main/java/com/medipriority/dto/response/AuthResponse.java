package com.medipriority.dto.response;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        String role
) {
    public AuthResponse(String token, Long userId, String fullName, String email, String role) {
        this(token, "Bearer", userId, fullName, email, role);
    }
}
