package com.cloudstorage;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shares")
@CrossOrigin(origins = "*")
public class FileShareController {

    private final FileShareRepository fileShareRepository;
    private final FileRepository fileRepository;
    private final EmailService emailService;

    public FileShareController(
            FileShareRepository fileShareRepository,
            FileRepository fileRepository,
            EmailService emailService) {

        this.fileShareRepository = fileShareRepository;
        this.fileRepository = fileRepository;
        this.emailService = emailService;
    }

    // =====================================================
    // SHARE FILE
    // =====================================================

    @PostMapping("/share")
    public ResponseEntity<String> shareFile(
            @RequestBody FileShare share) {

        try {

            if (share.getFileId() == null) {
                return ResponseEntity.badRequest()
                        .body("File ID is required.");
            }

            if (share.getOwnerUsername() == null) {
                return ResponseEntity.badRequest()
                        .body("Owner username is required.");
            }

            if (share.getSharedWithEmail() == null) {
                return ResponseEntity.badRequest()
                        .body("Email is required.");
            }

            String owner = share.getOwnerUsername().trim();
            String email = share.getSharedWithEmail().trim();

            if (owner.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Owner username cannot be empty.");
            }

            if (email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Email cannot be empty.");
            }

            // Basic email validation
            if (!email.matches(
                    "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

                return ResponseEntity.badRequest()
                        .body("Please enter a valid email address.");
            }

            // =================================================
            // FIND FILE
            // =================================================

            File file = fileRepository
                    .findById(share.getFileId())
                    .orElse(null);

            if (file == null) {
                return ResponseEntity.badRequest()
                        .body("File does not exist.");
            }

            // =================================================
            // CHECK OWNER
            // =================================================

            if (!owner.equals(file.getUsername())) {
                return ResponseEntity.status(403)
                        .body("You are not the owner of this file.");
            }

            // =================================================
            // CHECK TRASH
            // =================================================

            if (file.isTrashed()) {
                return ResponseEntity.badRequest()
                        .body("Cannot share a file that is in Trash.");
            }

            // =================================================
            // CHECK FILE DATA
            // =================================================

            if (file.getFileData() == null ||
                    file.getFileData().length == 0) {

                return ResponseEntity.badRequest()
                        .body("File data is empty.");
            }

            // =================================================
            // SAVE SHARE
            // =================================================

            FileShare newShare = new FileShare();

            newShare.setFileId(file.getId());
            newShare.setOwnerUsername(owner);
            newShare.setSharedWithEmail(email);

            fileShareRepository.save(newShare);

            // =================================================
            // TRY TO SEND EMAIL
            // =================================================
            //
            // Email is OPTIONAL.
            //
            // Render Free blocks outbound SMTP connections,
            // so failure to send the email must NOT make
            // the file-sharing operation fail.
            // =================================================

            try {

                emailService.sendFileShareEmail(
                        email,
                        owner,
                        file.getFileName(),
                        file.getId(),
                        file.getFileData(),
                        file.getFileType()
                );

            } catch (Exception emailException) {

                // Log email failure, but DO NOT fail sharing.
                System.out.println(
                        "Email notification could not be sent: "
                                + emailException.getMessage()
                );
            }

            // =================================================
            // SHARE SUCCESS
            // =================================================

            return ResponseEntity.ok(
                    "File shared successfully with " + email
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body("File sharing failed: " + e.getMessage());
        }
    }

    // =====================================================
    // GET FILES SHARED WITH ME
    // =====================================================

    @GetMapping("/received")
    public ResponseEntity<List<FileShare>> getSharedFiles(
            @RequestParam String email) {

        return ResponseEntity.ok(
                fileShareRepository
                        .findBySharedWithEmail(email.trim())
        );
    }

    // =====================================================
    // GET FILES SHARED BY ME
    // =====================================================

    @GetMapping("/sent")
    public ResponseEntity<List<FileShare>> getSentShares(
            @RequestParam String username) {

        return ResponseEntity.ok(
                fileShareRepository
                        .findByOwnerUsername(username.trim())
        );
    }

    // =====================================================
    // UNSHARE
    // =====================================================

    @DeleteMapping("/unshare")
    public ResponseEntity<String> unshareFile(
            @RequestParam Long fileId,
            @RequestParam String ownerUsername,
            @RequestParam String sharedWithEmail) {

        try {

            String owner = ownerUsername.trim();
            String email = sharedWithEmail.trim();

            File file = fileRepository
                    .findById(fileId)
                    .orElse(null);

            if (file == null) {
                return ResponseEntity.badRequest()
                        .body("File does not exist.");
            }

            if (!owner.equals(file.getUsername())) {
                return ResponseEntity.status(403)
                        .body("You are not the owner of this file.");
            }

            FileShare share =
                    fileShareRepository
                            .findByFileIdAndSharedWithEmail(
                                    fileId,
                                    email
                            );

            if (share == null) {
                return ResponseEntity.badRequest()
                        .body("File is not shared with this email.");
            }

            fileShareRepository.deleteById(
                    share.getId()
            );

            return ResponseEntity.ok(
                    "File access removed successfully!"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body("Failed to remove file access.");
        }
    }
}