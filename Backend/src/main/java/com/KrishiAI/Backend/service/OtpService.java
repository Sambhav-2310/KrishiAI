package com.KrishiAI.Backend.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private final SecureRandom random = new SecureRandom();

    public String generateOtp() {

        int otp = 100000 + random.nextInt(900000);

        return String.valueOf(otp);
    }

    public LocalDateTime getExpiryTime() {

        return LocalDateTime.now().plusMinutes(5);
    }
}