package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.AuthResponseDTO;
import com.KrishiAI.Backend.dto.LoginRequestDTO;
import com.KrishiAI.Backend.dto.SignupRequestDTO;
import com.KrishiAI.Backend.dto.VerifyOtpRequestDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.entity.UserStatus;
import com.KrishiAI.Backend.exception.UserAlreadyExistsException;
import com.KrishiAI.Backend.repository.UserRepository;
import com.KrishiAI.Backend.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final BrevoEmailService brevoEmailService;


    // =========================
    // SIGNUP
    // =========================

    public SignupRequestDTO register(SignupRequestDTO signupRequestDTO) {

        // Check email
        if (signupRequestDTO.getEmail() != null &&
                !signupRequestDTO.getEmail().isBlank() &&
                userRepository.existsByEmail(
                        signupRequestDTO.getEmail())) {

            throw new UserAlreadyExistsException(
                    "Email already exists"
            );
        }

        // Check phone
        if (userRepository.existsByPhone(
                signupRequestDTO.getPhone())) {

            throw new UserAlreadyExistsException(
                    "Phone number already exists"
            );
        }

        // Create user
        UserEntity user = new UserEntity();

        user.setName(signupRequestDTO.getName());
        user.setEmail(signupRequestDTO.getEmail());
        user.setPhone(signupRequestDTO.getPhone());

        user.setCountry(signupRequestDTO.getCountry());
        user.setState(signupRequestDTO.getState());
        user.setCity(signupRequestDTO.getCity());
        user.setLocation(signupRequestDTO.getLocation());

        user.setPassword(
                passwordEncoder.encode(
                        signupRequestDTO.getPassword()
                )
        );

        user.setRole(signupRequestDTO.getRole());
        user.setStatus(UserStatus.INACTIVE);

        // Generate OTP
        String otp = otpService.generateOtp();

        user.setOtp(otp);

        // OTP expires in 5 minutes
        user.setOtpExpiry(
                otpService.getExpiryTime()
        );

        // Save user
        userRepository.save(user);

        // Send OTP to email
        brevoEmailService.sendOtp(
                user.getEmail(),
                otp
        );

        return signupRequestDTO;
    }


    // =========================
    // VERIFY OTP
    // =========================

    public void verifyOtp(VerifyOtpRequestDTO request) {

        // Find user by email
        UserEntity user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Check whether OTP exists
        if (user.getOtp() == null) {
            throw new RuntimeException(
                    "No OTP found. Please request a new OTP."
            );
        }

        // Check OTP
        if (!user.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        // Check expiry
        if (user.getOtpExpiry() == null ||
                user.getOtpExpiry().isBefore(LocalDateTime.now())) {

            throw new RuntimeException("OTP expired");
        }

        // Activate user
        user.setStatus(UserStatus.ACTIVE);

        // Remove OTP after successful verification
        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);
    }


    // =========================
    // LOGIN
    // =========================

    public AuthResponseDTO login(LoginRequestDTO loginRequestDTO) {

        String email = loginRequestDTO.getEmail()
                .trim()
                .toLowerCase();


        UserEntity user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        boolean passwordMatches = passwordEncoder.matches(
                loginRequestDTO.getPassword(),
                user.getPassword()
        );

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException(
                    "Please verify your email first"
            );
        }

        if (!passwordMatches) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(user);

        return AuthResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public void resendOtp(String email) {

        // Find user by email
        UserEntity user = userRepository
                .findByEmail(email.trim())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Do not resend OTP for an already verified account
        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new RuntimeException("Account is already verified");
        }

        // Generate a new OTP using the existing OtpService
        String otp = otpService.generateOtp();

        // Save new OTP
        user.setOtp(otp);

        // New OTP gets a fresh 5-minute expiry
        user.setOtpExpiry(
                otpService.getExpiryTime()
        );

        // Save updated OTP
        userRepository.save(user);

        // Send new OTP using the existing Brevo service
        brevoEmailService.sendOtp(
                user.getEmail(),
                otp
        );
    }
}