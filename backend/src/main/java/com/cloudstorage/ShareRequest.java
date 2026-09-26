package com.cloudstorage;

public class ShareRequest {

    private Long fileId;

    private String ownerUsername;

    private String sharedWithUsername;

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public String getSharedWithUsername() {
        return sharedWithUsername;
    }

    public void setSharedWithUsername(String sharedWithUsername) {
        this.sharedWithUsername = sharedWithUsername;
    }
}