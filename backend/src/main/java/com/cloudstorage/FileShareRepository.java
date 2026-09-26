package com.cloudstorage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileShareRepository extends JpaRepository<FileShare, Long> {

    List<FileShare> findBySharedWithEmail(String sharedWithEmail);

    List<FileShare> findByOwnerUsername(String ownerUsername);

    FileShare findByFileIdAndSharedWithEmail(
            Long fileId,
            String sharedWithEmail
    );
}