package com.cloudstorage;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =====================================================
    // SEND FILE SHARE EMAIL
    // =====================================================

    public void sendFileShareEmail(
            String recipientEmail,
            String ownerUsername,
            String fileName,
            Long fileId,
            byte[] fileData,
            String fileType
    ) throws MessagingException {

        // Create email message
        MimeMessage message =
                mailSender.createMimeMessage();

        // true = email supports attachments
        MimeMessageHelper helper =
                new MimeMessageHelper(message, true);

        // -------------------------------------------------
        // RECIPIENT
        // -------------------------------------------------

        helper.setTo(recipientEmail);

        // -------------------------------------------------
        // SUBJECT
        // -------------------------------------------------

        helper.setSubject(
                ownerUsername + " shared a file with you"
        );

        // -------------------------------------------------
        // EMAIL BODY
        // -------------------------------------------------

        String body =
                "Hello,\n\n" +

                ownerUsername +
                " has shared a file with you through Cloud Storage System.\n\n" +

                "File name: " +
                fileName +
                "\n\n" +

                "The actual file is attached to this email.\n\n" +

                "You do not need a Cloud Storage account to receive this file.\n\n" +

                "Regards,\n" +
                "Cloud Storage System";

        helper.setText(body);

        // -------------------------------------------------
        // ATTACH ACTUAL FILE
        // -------------------------------------------------

        ByteArrayResource fileResource =
                new ByteArrayResource(fileData);

        helper.addAttachment(
                fileName,
                fileResource
        );

        // -------------------------------------------------
        // SEND EMAIL
        // -------------------------------------------------

        mailSender.send(message);
    }
}