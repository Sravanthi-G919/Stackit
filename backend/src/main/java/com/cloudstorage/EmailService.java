package com.cloudstorage;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${RESEND_API_KEY}")
    private String resendApiKey;

    @Value("${RESEND_FROM_EMAIL}")
    private String fromEmail;

    @Async
    public void sendFileShareEmail(
            String recipientEmail,
            String ownerUsername,
            String fileName,
            Long fileId,
            byte[] fileData,
            String fileType
    ) {

        try {

            Resend resend = new Resend(resendApiKey);

            CreateEmailOptions emailOptions =
                    CreateEmailOptions.builder()
                            .from(fromEmail)
                            .to(recipientEmail)
                            .subject(
                                    ownerUsername
                                            + " shared a file with you"
                            )
                            .html(
                                    "<h2>File shared with you</h2>"
                                            + "<p>Hello,</p>"
                                            + "<p><strong>"
                                            + ownerUsername
                                            + "</strong> has shared a file with you through Stackit.</p>"
                                            + "<p><strong>File name:</strong> "
                                            + fileName
                                            + "</p>"
                                            + "<p>You can access the shared file through Stackit.</p>"
                                            + "<p>Regards,<br>Stackit</p>"
                            )
                            .build();

            resend.emails().send(emailOptions);

        } catch (Exception e) {

            // Email failure does not stop file sharing.
        }
    }
}