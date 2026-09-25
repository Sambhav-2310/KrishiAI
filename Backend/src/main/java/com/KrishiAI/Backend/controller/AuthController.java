package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.*;
import com.KrishiAI.Backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDTO signupRequestDTO) {
        SignupRequestDTO registerUser = authService.register(signupRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(registerUser);

    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
            @RequestBody LoginRequestDTO loginRequestDTO) {

        AuthResponseDTO response = authService.login(loginRequestDTO);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {

        return ResponseEntity.ok(
                Map.of(
                        "status", "UP",
                        "message", "JWT authentication is working"
                )
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequestDTO request) {

        authService.verifyOtp(request);

        return ResponseEntity.ok(
                "Email verified successfully"
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(
            @RequestBody ResendOtpRequestDTO request
    ) {
        authService.resendOtp(request.getEmail());
        return ResponseEntity.ok("OTP resent successfully");
    }
}
