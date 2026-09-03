package com.shelf.sync.security;

import com.shelf.sync.entity.User;
import com.shelf.sync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            throw new UsernameNotFoundException("Username or email cannot be empty");
        }
        String query = usernameOrEmail.trim();
        User user = userRepository.findByUsername(query)
                .or(() -> userRepository.findByEmail(query))
                .or(() -> userRepository.findByUsernameOrEmail(query, query))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + query));

        return UserDetailsImpl.build(user);
    }
}
