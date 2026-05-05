package com.portfolio.controller;

import com.portfolio.dto.ContactRequest;
import com.portfolio.model.ContactMessage;
import com.portfolio.service.ContactService;
import com.portfolio.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> submitContact(@Valid @RequestBody ContactRequest request) {
        try {
            ContactMessage saved = contactService.save(request);
            
            // Send email notification in the background
            new Thread(() -> {
                try {
                    emailService.sendContactNotification(request);
                } catch (Exception e) {
                    System.err.println("Failed to send email notification: " + e.getMessage());
                }
            }).start();

            return ResponseEntity.status(201).body(Map.of(
                    "id", saved.getId(),
                    "name", saved.getName(),
                    "email", saved.getEmail(),
                    "subject", saved.getSubject(),
                    "message", saved.getMessage(),
                    "createdAt", saved.getCreatedAt().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        List<ContactMessage> messages = contactService.getAllMessages();
        return ResponseEntity.ok(messages);
    }
}
