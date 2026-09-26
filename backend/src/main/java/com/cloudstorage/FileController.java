package com.cloudstorage;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final FileRepository fileRepository;

    public FileController(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    // =========================
    // MY DRIVE
    // =========================

    @GetMapping
    public ResponseEntity<List<File>> getUserFiles(
            @RequestParam String username) {

        return ResponseEntity.ok(
                fileRepository.findByUsernameAndTrashedFalse(username)
        );
    }

    // =========================
    // GET FILE DETAILS
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<File> getFileById(
            @PathVariable Long id) {

        File file = fileRepository.findById(id).orElse(null);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        file.setFileData(null);

        return ResponseEntity.ok(file);
    }

    // =========================
    // UPLOAD
    // =========================

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile multipartFile,
            @RequestParam("username") String username) {

        try {

            if (multipartFile.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Please select a file.");
            }

            File file = new File();

            file.setFileName(multipartFile.getOriginalFilename());
            file.setFileType(multipartFile.getContentType());
            file.setFileSize(multipartFile.getSize());
            file.setFileData(multipartFile.getBytes());
            file.setUsername(username);

            file.setStarred(false);
            file.setTrashed(false);

            fileRepository.save(file);

            return ResponseEntity.ok(
                    "File uploaded successfully!"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body("File upload failed.");
        }
    }

    // =========================
    // DOWNLOAD
    // =========================

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long id) {

        File file = fileRepository.findById(id).orElse(null);

        if (file == null || file.isTrashed()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(
                        "Content-Disposition",
                        "attachment; filename=\"" +
                                file.getFileName() + "\""
                )
                .header(
                        "Content-Type",
                        file.getFileType() != null
                                ? file.getFileType()
                                : "application/octet-stream"
                )
                .body(file.getFileData());
    }

    // =========================
    // ⭐ STAR FILE
    // =========================

    @PutMapping("/{id}/star")
    public ResponseEntity<String> starFile(
            @PathVariable Long id,
            @RequestParam String username) {

        File file = fileRepository.findById(id).orElse(null);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        if (!file.getUsername().equals(username)) {
            return ResponseEntity.status(403)
                    .body("You cannot modify this file.");
        }

        if (file.isTrashed()) {
            return ResponseEntity.badRequest()
                    .body("File is in trash.");
        }

        file.setStarred(true);
        fileRepository.save(file);

        return ResponseEntity.ok(
                "File added to Starred."
        );
    }

    // =========================
    // ⭐ UNSTAR FILE
    // =========================

    @DeleteMapping("/{id}/star")
    public ResponseEntity<String> unstarFile(
            @PathVariable Long id,
            @RequestParam String username) {

        File file = fileRepository.findById(id).orElse(null);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        if (!file.getUsername().equals(username)) {
            return ResponseEntity.status(403)
                    .body("You cannot modify this file.");
        }

        file.setStarred(false);
        fileRepository.save(file);

        return ResponseEntity.ok(
                "File removed from Starred."
        );
    }

    // =========================
    // ⭐ GET STARRED FILES
    // =========================

    @GetMapping("/starred")
    public ResponseEntity<List<File>> getStarredFiles(
            @RequestParam String username) {

        return ResponseEntity.ok(
                fileRepository
                        .findByUsernameAndStarredTrueAndTrashedFalse(username)
        );
    }

    // =========================
    // 🗑️ MOVE TO TRASH
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> moveToTrash(
            @PathVariable Long id,
            @RequestParam String username) {

        File file = fileRepository.findById(id).orElse(null);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        if (!file.getUsername().equals(username)) {
            return ResponseEntity.status(403)
                    .body("You cannot delete this file.");
        }

        file.setTrashed(true);
        file.setStarred(false);

        fileRepository.save(file);

        return ResponseEntity.ok(
                "File moved to Trash."
        );
    }

    // =========================
    // 🗑️ GET TRASH
    // =========================

    @GetMapping("/trash")
    public ResponseEntity<List<File>> getTrash(
            @RequestParam String username) {

        return ResponseEntity.ok(
                fileRepository.findByUsernameAndTrashedTrue(username)
        );
    }

    // =========================
    // ♻️ RESTORE
    // =========================

    @PutMapping("/{id}/restore")
    public ResponseEntity<String> restoreFile(
            @PathVariable Long id,
            @RequestParam String username) {

        File file = fileRepository.findById(id).orElse(null);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        if (!file.getUsername().equals(username)) {
            return ResponseEntity.status(403)
                    .body("You cannot restore this file.");
        }

        file.setTrashed(false);

        fileRepository.save(file);

        return ResponseEntity.ok(
                "File restored successfully."
        );
    }

    // =========================
    // ❌ PERMANENT DELETE
    // =========================

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<String> permanentDelete(
            @PathVariable Long id,
            @RequestParam String username) {

        File file = fileRepository.findById(id).orElse(null);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        if (!file.getUsername().equals(username)) {
            return ResponseEntity.status(403)
                    .body("You cannot delete this file.");
        }

        if (!file.isTrashed()) {
            return ResponseEntity.badRequest()
                    .body("File must be in Trash first.");
        }

        fileRepository.deleteById(id);

        return ResponseEntity.ok(
                "File permanently deleted."
        );
    }
}