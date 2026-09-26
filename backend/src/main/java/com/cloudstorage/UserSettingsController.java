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

        String current = currentUsername.trim();
        String newName = newUsername.trim();

        if (newName.isEmpty() ||
                !newName.matches("^[A-Za-z][A-Za-z0-9]*$")) {

            return ResponseEntity.badRequest()
                    .body("Please enter a valid username.");
        }

        User user = userRepository.findByUsername(current);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // No change needed
        if (current.equals(newName)) {
            return ResponseEntity.ok(
                    "Username is already set to this value."
            );
        }

        // Check duplicate username
        if (userRepository.existsByUsername(newName)) {

            return ResponseEntity.badRequest()
                    .body("Username already exists.");
        }

        user.setUsername(newName);
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

        String email = newEmail.trim();

        if (!email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            return ResponseEntity.badRequest()
                    .body("Please enter a valid email.");
        }

        User user = userRepository.findByUsername(
                username.trim()
        );

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        User existingUser =
                userRepository.findByEmail(email);

        if (existingUser != null &&
                !existingUser.getId().equals(user.getId())) {

            return ResponseEntity.badRequest()
                    .body("Email already exists.");
        }

        user.setEmail(email);
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

        User user = userRepository.findByUsername(
                username.trim()
        );

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

        // Validate new password
        if (newPassword == null ||
                newPassword.length() < 6) {

            return ResponseEntity.badRequest()
                    .body(
                            "New password must contain at least 6 characters."
                    );
        }

        // Prevent using the same password
        if (passwordEncoder.matches(
                newPassword,
                user.getPassword())) {

            return ResponseEntity.badRequest()
                    .body(
                            "New password must be different from current password."
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