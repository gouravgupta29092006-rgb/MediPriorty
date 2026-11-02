package com.medipriority.service;

import com.medipriority.dto.request.LoginRequest;
import com.medipriority.dto.response.AuthResponse;
import com.medipriority.dto.response.UserResponse;
import com.medipriority.exception.ResourceNotFoundException;
import com.medipriority.model.User;
import com.medipriority.repository.UserRepository;
import com.medipriority.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.email() != null ? request.email().trim() : "";
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, request.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + cleanEmail));

        String token = jwtTokenProvider.generateToken(
                user.getEmail(), user.getRole().name(), user.getUserId());

        return new AuthResponse(token, user.getUserId(), user.getFullName(),
                user.getEmail(), user.getRole().name());
    }

    public UserResponse getCurrentUser() {
        UserDetails userDetails = (UserDetails)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDetails.getUsername()));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getUserId(), user.getFullName(), user.getEmail(),
                user.getRole(), user.isActive(), user.getCreatedAt());
    }
}
