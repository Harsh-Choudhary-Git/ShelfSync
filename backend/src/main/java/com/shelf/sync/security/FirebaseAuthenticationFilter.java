package com.shelf.sync.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.entity.UserStatus;
import com.shelf.sync.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthenticationFilter.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = parseBearerToken(request);
            if (token != null) {
                FirebaseToken decodedToken = null;
                try {
                    decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                } catch (Exception e) {
                    logger.debug("Firebase ID token verification failed: {}", e.getMessage());
                }

                if (decodedToken != null) {
                    String email = decodedToken.getEmail();
                    String uid = decodedToken.getUid();
                    String name = decodedToken.getName();

                    if (email != null && !email.trim().isEmpty()) {
                        email = email.trim();
                        Optional<User> existingUser = userRepository.findByEmail(email);

                        User user;
                        if (existingUser.isPresent()) {
                            user = existingUser.get();
                        } else {
                            // Auto-provision user on first Firebase login
                            String username = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
                            if (userRepository.existsByUsername(username)) {
                                username = username + "_" + uid.substring(0, Math.min(5, uid.length()));
                            }

                            String firstName = "User";
                            String lastName = "";
                            if (name != null && !name.trim().isEmpty()) {
                                String[] parts = name.trim().split("\\s+", 2);
                                firstName = parts[0];
                                if (parts.length > 1) {
                                    lastName = parts[1];
                                }
                            }

                            Role defaultRole = Role.ROLE_MEMBER;
                            if (email.toLowerCase().contains("admin")) {
                                defaultRole = Role.ROLE_ADMIN;
                            } else if (email.toLowerCase().contains("lib")) {
                                defaultRole = Role.ROLE_LIBRARIAN;
                            }

                            user = new User(
                                    username,
                                    email,
                                    "FIREBASE_AUTH",
                                    firstName,
                                    lastName,
                                    null,
                                    defaultRole
                            );
                            user.setStatus(UserStatus.ACTIVE);
                            user = userRepository.save(user);
                            logger.info("Auto-provisioned new User for Firebase account: {}", email);
                        }

                        if (user.getStatus() == UserStatus.ACTIVE) {
                            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        } else {
                            logger.warn("User with email {} is INACTIVE. Denying access.", email);
                        }
                    }
                } else if (token.startsWith("dev-token:") || token.startsWith("demo-")) {
                    // Local dev / demo mode token authentication fallback
                    String identifier = token.startsWith("dev-token:") ? token.substring("dev-token:".length()).trim() : token.substring("demo-".length()).trim();
                    String cleanUsername = identifier.contains("@") ? identifier.split("@")[0] : identifier;

                    Optional<User> targetUser = userRepository.findByEmail(identifier)
                            .or(() -> userRepository.findByUsername(identifier))
                            .or(() -> userRepository.findByUsername(cleanUsername))
                            .or(() -> userRepository.findByEmail(cleanUsername + "@shelfsync.io"));

                    if (targetUser.isPresent()) {
                        User user = targetUser.get();
                        if (user.getStatus() == UserStatus.ACTIVE) {
                            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            logger.debug("Authenticated dev user session: {}", user.getUsername());
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication in FirebaseAuthenticationFilter: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseBearerToken(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7).trim();
        }
        return null;
    }
}
