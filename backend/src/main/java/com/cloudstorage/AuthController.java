package com.cloudstorage;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // SIGNUP
    // =====================================================

    @PostMapping("/signup")
    public ResponseEntity<String> signup(
            @RequestBody User user) {

        // Username validation
        if (user.getUsername() == null ||
                user.getUsername().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Username cannot be empty.");
        }

        // Email validation
        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email cannot be empty.");
        }

        // Password validation
        if (user.getPassword() == null ||
                user.getPassword().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Password cannot be empty.");
        }

        // Password length
        if (user.getPassword().length() < 6) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Password must contain at least 6 characters."
                    );
        }

        // Username validation
        String username = user.getUsername().trim();

        if (!username.matches(
                "^(?=.*[A-Za-z])[A-Za-z0-9_]+$")) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid username. Use letters, numbers and underscore only, and include at least one letter."
                    );
        }

        // Email validation
        String email = user.getEmail().trim();

        if (!email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Please enter a valid email address."
                    );
        }

        // Check username
        if (userRepository.findByUsername(username) != null) {

            return ResponseEntity
                    .badRequest()
                    .body("Username already exists.");
        }

        // Check email
        if (userRepository.findByEmail(email) != null) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already exists.");
        }

        // Save user
        user.setUsername(username);
        user.setEmail(email);

        // Store password as BCrypt hash
        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                "Account created successfully!"
        );
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request) {

        try {

            // Username validation
            if (request.getUsername() == null ||
                    request.getUsername().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Username cannot be empty.");
            }

            // Current password validation
            if (request.getCurrentPassword() == null ||
                    request.getCurrentPassword().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Current password cannot be empty."
                        );
            }

            // New password validation
            if (request.getNewPassword() == null ||
                    request.getNewPassword().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "New password cannot be empty."
                        );
            }

            // New password length
            if (request.getNewPassword().length() < 6) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "New password must contain at least 6 characters."
                        );
            }

            String username =
                    request.getUsername().trim();

            // Find user
            User user =
                    userRepository.findByUsername(username);

            if (user == null) {

                return ResponseEntity
                        .badRequest()
                        .body("User not found.");
            }

            // Check current password
            boolean currentPasswordCorrect =
                    passwordEncoder.matches(
                            request.getCurrentPassword(),
                            user.getPassword()
                    );

            if (!currentPasswordCorrect) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Current password is incorrect."
                        );
            }

            // Check whether new password is same
            if (passwordEncoder.matches(
                    request.getNewPassword(),
                    user.getPassword())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "New password must be different from current password."
                        );
            }

            // Encode and save new password
            user.setPassword(
                    passwordEncoder.encode(
                            request.getNewPassword()
                    )
            );

            userRepository.save(user);

            return ResponseEntity.ok(
                    "Password changed successfully!"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Password change failed."
                    );
        }
    }
}