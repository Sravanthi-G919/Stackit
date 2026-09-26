package com.cloudstorage;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
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

        // =========================
        // BASIC VALIDATION
        // =========================

        if (user.getUsername() == null ||
                user.getUsername().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Username cannot be empty.");
        }

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email cannot be empty.");
        }

        if (user.getPassword() == null ||
                user.getPassword().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Password cannot be empty.");
        }

        // =========================
        // USERNAME VALIDATION
        // =========================

        String username = user.getUsername().trim();

        if (!username.matches(
                "^(?=.*[A-Za-z])[A-Za-z0-9_]+$")) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid username. Use letters, numbers and underscore only, and include at least one letter."
                    );
        }

        // =========================
        // CHECK USERNAME
        // =========================

        if (userRepository.findByUsername(username) != null) {

            return ResponseEntity
                    .badRequest()
                    .body("Username already exists");
        }

        // =========================
        // CHECK EMAIL
        // =========================

        String email = user.getEmail().trim();

        if (userRepository.findByEmail(email) != null) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already exists");
        }

        // =========================
        // SAVE USER
        // =========================

        user.setUsername(username);
        user.setEmail(email);

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

            // =========================
            // BASIC VALIDATION
            // =========================

            if (request.getUsername() == null ||
                    request.getUsername().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Username cannot be empty.");
            }

            if (request.getCurrentPassword() == null ||
                    request.getCurrentPassword().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Current password cannot be empty.");
            }

            if (request.getNewPassword() == null ||
                    request.getNewPassword().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("New password cannot be empty.");
            }

            String username =
                    request.getUsername().trim();

            // =========================
            // FIND USER
            // =========================

            User user =
                    userRepository.findByUsername(username);

            if (user == null) {

                return ResponseEntity
                        .badRequest()
                        .body("User not found.");
            }

            // =========================
            // CHECK CURRENT PASSWORD
            // =========================

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

            // =========================
            // CHECK NEW PASSWORD
            // =========================

            if (passwordEncoder.matches(
                    request.getNewPassword(),
                    user.getPassword())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "New password must be different from current password."
                        );
            }

            // =========================
            // PASSWORD LENGTH
            // =========================

            if (request.getNewPassword().length() < 6) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "New password must contain at least 6 characters."
                        );
            }

            // =========================
            // UPDATE PASSWORD
            // =========================

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

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Password change failed: "
                                    + e.getMessage()
                    );
        }
    }
}