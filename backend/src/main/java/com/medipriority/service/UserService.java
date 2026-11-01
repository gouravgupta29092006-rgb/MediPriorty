package com.medipriority.service;

import com.medipriority.dto.request.UserRequest;
import com.medipriority.dto.response.UserResponse;
import com.medipriority.exception.ResourceConflictException;
import com.medipriority.exception.ResourceNotFoundException;
import com.medipriority.model.User;
import com.medipriority.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public UserResponse create(UserRequest req, Long actingUserId) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ResourceConflictException("Email already registered: " + req.email());
        }
        User user = User.builder()
                .fullName(req.fullName())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(req.role())
                .active(true)
                .build();
        User saved = userRepository.save(user);
        auditService.log(actingUserId, "USER_CREATED", "User", saved.getUserId(), null);
        return toResponse(saved);
    }

    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    public UserResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public UserResponse toggleActive(Long id, boolean active, Long actingUserId) {
        User user = getOrThrow(id);
        user.setActive(active);
        auditService.log(actingUserId, active ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                "User", id, null);
        return toResponse(userRepository.save(user));
    }

    private User getOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getUserId(), u.getFullName(), u.getEmail(),
                u.getRole(), u.isActive(), u.getCreatedAt());
    }
}
