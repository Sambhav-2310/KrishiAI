package com.KrishiAI.Backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity httpSecurity) throws Exception {

        httpSecurity
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/status",
                                "/api/auth/signup",
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/health",
                                "/api/auth/verify-otp",
                                "/api/auth/resend-otp"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/uploads/**"
                        ).permitAll()
                                // =========================
                                // CATEGORIES
                                // =========================

                                // Admin can see ALL categories
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/categories/admin"
                                ).hasRole("ADMIN")

                                // Public can see ACTIVE categories
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/categories"
                                ).permitAll()

                                // Admin create
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/categories/**"
                                ).hasRole("ADMIN")

                                // Admin update + activate
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/categories/**"
                                ).hasRole("ADMIN")

                                // Admin deactivate
                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/categories/**"
                                ).hasRole("ADMIN")


                        // Products
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products"
                        ).hasRole("FARMER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/products/**"
                        ).hasRole("FARMER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/products/**"
                        ).hasRole("FARMER")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products/image"
                        ).hasRole("FARMER")

                        //AI
                        .requestMatchers("/api/ai/**").hasRole("FARMER")

                        // CART
                        .requestMatchers(
                                 "/api/cart/**"
                        ).hasRole("CONSUMER")

                        // FARMER DASHBOARD
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/farmer/dashboard"
                        ).hasRole("FARMER")

                        // ORDERS - FARMER
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/farmer"
                        ).hasRole("FARMER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/items/*/status"
                        ).hasRole("FARMER")


                        // ORDERS - CONSUMER
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/my"
                        ).hasRole("CONSUMER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/*"
                        ).hasRole("CONSUMER")

                        // ADMIN
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // CHECKOUT
                        .requestMatchers(
                                "/api/checkout"
                        ).hasRole("CONSUMER")

                        // PAYMENT
                        .requestMatchers("/api/payment/**")
                        .hasRole("CONSUMER")

                        // Everything else
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .addFilterBefore(
                        jwtRequestFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return httpSecurity.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}