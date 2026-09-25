package com.KrishiAI.Backend.config;

import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.repository.UserRepository;
import com.KrishiAI.Backend.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Get Authorization header
        String authHeader = request.getHeader("Authorization");

        // 2. Check if JWT exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract token
        String token = authHeader.substring(7);

        try {

            // 4. Extract email from JWT
            String email = jwtService.extractEmail(token);

            // 5. Continue only if user is not already authenticated
            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Find user
                UserEntity user = userRepository
                        .findByEmail(email)
                        .orElse(null);

                if (user != null && jwtService.isTokenValid(token, user)) {

                    // 7. Create authorities from role
                    List<SimpleGrantedAuthority> authorities =
                            List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_" + user.getRole().name()
                                    )
                            );

                    // 8. Create authentication object
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    authorities
                            );

                    // 9. Store authentication in SecurityContext
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception exception) {

            // Invalid/expired JWT
            SecurityContextHolder.clearContext();
        }

        // 10. Continue request
        filterChain.doFilter(request, response);
    }
}