package com.portfolio.controller;

import com.portfolio.dto.AiAnalyzeRequest;
import com.portfolio.dto.AiChatRequest;
import com.portfolio.service.AiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@Valid @RequestBody AiChatRequest request) {
        try {
            Map<String, Object> result = aiService.chat(request.getMessage(), request.getContext());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "AI service error: " + e.getMessage()));
        }
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@Valid @RequestBody AiAnalyzeRequest request) {
        try {
            Map<String, Object> result = aiService.analyze(request.getSection(), request.getContent());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "AI analysis error: " + e.getMessage()));
        }
    }
}
