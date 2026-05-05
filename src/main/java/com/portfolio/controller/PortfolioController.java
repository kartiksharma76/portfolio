package com.portfolio.controller;

import com.portfolio.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    @Autowired
    private ContactService contactService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long messageCount = contactService.getMessageCount();
        return ResponseEntity.ok(Map.of(
                "totalProjects", 6,
                "totalSkills", 12,
                "totalCertifications", 4,
                "totalMessages", messageCount,
                "yearsExperience", 3
        ));
    }
}
