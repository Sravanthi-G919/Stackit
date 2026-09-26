package com.cloudstorage;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserSettingsController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserSettingsController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // UPDATE USERNAME
    // =========================

    @PutMapping("/username")
    public ResponseEntity<String> updateUsername(
            @RequestParam String currentUsername,
            @RequestParam String newUsername) {

        // Username must:
        // 1. Start with a letter
        // 2. Contain only letters and numbers
        // 3. Not contain special characters

        if (newUsername == null ||
                !newUsername.matches("^[A-Za-z][A-Za-z0-9]*$")) {

            return ResponseEntity.badRequest()
                    .body("Please enter a valid username.");
        }

        User user = userRepository.findByUsername(currentUsername);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Check if new username is already used
        if (userRepository.existsByUsername(newUsername)) {

            return ResponseEntity.badRequest()
                    .body("Username already exists.");
        }

        user.setUsername(newUsername);

        userRepository.save(user);

        return ResponseEntity.ok(
                "Username updated successfully."
        );
    }

    // =========================
    // UPDATE EMAIL
    // =========================

    @PutMapping("/email")
    public ResponseEntity<String> updateEmail(
            @RequestParam String username,
            @RequestParam String newEmail) {

        if (newEmail == null ||
                newEmail.trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Please enter a valid email.");
        }

        User user = userRepository.findByUsername(username);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Check whether email belongs to another user
        User existingUser = userRepository.findByEmail(newEmail);

        if (existingUser != null &&
                !existingUser.getId().equals(user.getId())) {

            return ResponseEntity.badRequest()
                    .body("Email already exists.");
        }

        user.setEmail(newEmail);

        userRepository.save(user);

        return ResponseEntity.ok(
                "Email updated successfully."
        );
    }

    // =========================
    // UPDATE PASSWORD
    // =========================

    @PutMapping("/password")
    public ResponseEntity<String> updatePassword(
            @RequestParam String username,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {

        User user = userRepository.findByUsername(username);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Check current password
        if (!passwordEncoder.matches(
                currentPassword,
                user.getPassword())) {

            return ResponseEntity.badRequest()
                    .body("Current password is incorrect.");
        }

        // Check new password
        if (newPassword == null ||
                newPassword.length() < 6) {

            return ResponseEntity.badRequest()
                    .body(
                            "New password must contain at least 6 characters."
                    );
        }

        // Encrypt new password
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                "Password updated successfully."
        );
    }
}