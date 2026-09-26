package com.cloudstorage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileRepository extends JpaRepository<File, Long> {

    List<File> findByUsernameAndTrashedFalse(String username);

    List<File> findByUsernameAndStarredTrueAndTrashedFalse(String username);

    List<File> findByUsernameAndTrashedTrue(String username);
}