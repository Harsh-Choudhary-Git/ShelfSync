package com.shelf.sync;

import com.shelf.sync.dto.AuthRequest;
import com.shelf.sync.dto.AuthResponse;
import com.shelf.sync.dto.RegisterRequest;
import com.shelf.sync.dto.UserResponse;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.entity.UserStatus;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.repository.UserRepository;
import com.shelf.sync.security.JwtUtils;
import com.shelf.sync.security.UserDetailsImpl;
import com.shelf.sync.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("testuser", "test@example.com", "encodedPassword", "Test", "User", "+1234567890", Role.ROLE_MEMBER);
        sampleUser.setId(1L);
        sampleUser.setStatus(UserStatus.ACTIVE);
    }

    @Test
    void testRegisterMember_Success() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "password123", "New", "User", "+1234567890");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UserResponse response = authService.registerMember(request);

        assertNotNull(response);
        assertEquals(sampleUser.getUsername(), response.getUsername());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterMember_DuplicateUsername_ThrowsConflict() {
        RegisterRequest request = new RegisterRequest("testuser", "new@example.com", "password123", "New", "User", "+1234567890");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.registerMember(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterMember_DuplicateEmail_ThrowsConflict() {
        RegisterRequest request = new RegisterRequest("newuser", "test@example.com", "password123", "New", "User", "+1234567890");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.registerMember(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testAuthenticateUser_Success() {
        AuthRequest request = new AuthRequest("testuser", "password123");
        UserDetailsImpl userDetails = UserDetailsImpl.build(sampleUser);
        Authentication auth = mock(Authentication.class);

        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("mock.jwt.token");
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.authenticateUser(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("testuser", response.getUser().getUsername());
    }
}
