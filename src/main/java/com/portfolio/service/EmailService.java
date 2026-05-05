package com.portfolio.service;

import com.portfolio.dto.ContactRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendContactNotification(ContactRequest request) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        // This will send the email to yourself (the portfolio owner)
        message.setTo("kartiksharma768976@gmail.com");
        message.setSubject("New Portfolio Contact: " + request.getSubject());
        
        String emailBody = "You have received a new contact message from your portfolio website!\n\n" +
                "Name: " + request.getName() + "\n" +
                "Email: " + request.getEmail() + "\n\n" +
                "Message:\n" + request.getMessage();
                
        message.setText(emailBody);
        
        // You can set the replyTo field so if you hit 'Reply', it replies to the visitor!
        message.setReplyTo(request.getEmail());

        mailSender.send(message);
    }
}
