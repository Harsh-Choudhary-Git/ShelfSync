package com.shelf.sync.service;

import com.shelf.sync.dto.AuthRequest;
import com.shelf.sync.dto.AuthResponse;
import com.shelf.sync.dto.RegisterRequest;
import com.shelf.sync.dto.UserResponse;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.entity.UserStatus;
import com.shelf.sync.exception.BadRequestException;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.exception.UnauthorizedException;
import com.shelf.sync.repository.UserRepository;
import com.shelf.sync.security.JwtUtils;
import com.shelf.sync.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse authenticateUser(AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Your account is deactivated. Please contact an administrator.");
        }

        return new AuthResponse(jwt, new UserResponse(user));
    }

    @Transactional
    public UserResponse registerMember(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new ConflictException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ConflictException("Error: Email is already in use!");
        }

        User user = new User(
                registerRequest.getUsername().trim(),
                registerRequest.getEmail().trim(),
                encoder.encode(registerRequest.getPassword()),
                registerRequest.getFirstName().trim(),
                registerRequest.getLastName().trim(),
                registerRequest.getPhone() != null ? registerRequest.getPhone().trim() : null,
                Role.ROLE_MEMBER
        );

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new UnauthorizedException("User is not authenticated");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        return new UserResponse(user);
    }

    @Transactional(readOnly = true)
    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new UnauthorizedException("User is not authenticated");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));
    }
}
