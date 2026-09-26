package com.cloudstorage;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class LoginController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginController(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody LoginRequest request) {

        System.out.println("LOGIN USERNAME: " + request.getUsername());
        System.out.println("LOGIN PASSWORD: " + request.getPassword());

        User user = userRepository.findByUsername(
                request.getUsername()
        );

        if (user == null) {
            System.out.println("USER NOT FOUND");
            return ResponseEntity
                    .status(401)
                    .body("Invalid username or password");
        }

        System.out.println("USER FOUND: " + user.getUsername());
        System.out.println("PASSWORD MATCH: " +
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .status(401)
                    .body("Invalid username or password");
        }

        return ResponseEntity.ok("Login successful!");
    }
}