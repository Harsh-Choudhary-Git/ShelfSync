package com.shelf.sync;

import com.shelf.sync.dto.RegisterRequest;
import com.shelf.sync.dto.UserResponse;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.entity.UserStatus;
import com.shelf.sync.exception.ConflictException;
import com.shelf.sync.repository.UserRepository;
import com.shelf.sync.security.UserDetailsImpl;
import com.shelf.sync.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("testuser", "test@example.com", "FIREBASE_AUTH", "Test", "User", "+1234567890", Role.ROLE_MEMBER);
        sampleUser.setId(1L);
        sampleUser.setStatus(UserStatus.ACTIVE);
    }

    @Test
    void testRegisterMember_Success() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "password123", "New", "User", "+1234567890");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
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
    void testGetCurrentUser_Success() {
        UserDetailsImpl userDetails = UserDetailsImpl.build(sampleUser);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserResponse response = authService.getCurrentUser();

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
    }
}
