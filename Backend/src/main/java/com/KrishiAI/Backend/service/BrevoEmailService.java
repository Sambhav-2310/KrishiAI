package com.KrishiAI.Backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BrevoEmailService {

    private final JavaMailSender mailSender;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    public void sendOtp(String recipientEmail, String otp) {

        try {

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);

            helper.setFrom(senderEmail);
            helper.setTo(recipientEmail);

            helper.setSubject(
                    "KrishiAI - Email Verification OTP"
            );

            String htmlContent = """
                    <html>
                    <body>
                        <h2>KrishiAI Email Verification</h2>

                        <p>Hello,</p>

                        <p>
                            Your OTP for verifying your
                            KrishiAI account is:
                        </p>

                        <h1>%s</h1>

                        <p>
                            This OTP is valid for 5 minutes.
                        </p>

                        <p>
                            Please do not share this OTP
                            with anyone.
                        </p>

                        <br>

                        <p>
                            Regards,<br>
                            KrishiAI Team
                        </p>
                    </body>
                    </html>
                    """.formatted(otp);

            helper.setText(htmlContent, true);

            mailSender.send(message);

            System.out.println(
                    "OTP email sent successfully to: "
                            + recipientEmail
            );

        } catch (MessagingException e) {

            System.out.println(
                    "Failed to send OTP email: "
                            + e.getMessage()
            );

            throw new RuntimeException(
                    "Unable to send OTP email"
            );
        }
    }
}