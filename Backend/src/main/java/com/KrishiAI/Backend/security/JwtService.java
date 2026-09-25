package com.KrishiAI.Backend.security;

import com.KrishiAI.Backend.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    // Generate JWT
    public String generateToken(UserEntity user) {

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis() + expiration
                        )
                )
                .signWith(getSigningKey())
                .compact();
    }

    // Extract all claims
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Extract a specific claim
    private <T> T extractClaim(
            String token,
            Function<Claims, T> resolver
    ) {

        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    // Extract email
    public String extractEmail(String token) {

        return extractClaim(token, Claims::getSubject);
    }

    // Extract expiration
    public Date extractExpiration(String token) {

        return extractClaim(token, Claims::getExpiration);
    }

    // Check expiration
    private boolean isTokenExpired(String token) {

        return extractExpiration(token).before(new Date());
    }

    // Validate token
    public boolean isTokenValid(
            String token,
            UserEntity user
    ) {

        String email = extractEmail(token);

        return email.equals(user.getEmail())
                && !isTokenExpired(token);
    }
}