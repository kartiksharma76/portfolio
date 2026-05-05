package com.portfolio.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AiService {
    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    @Value("${nvidia.api.key}")
    private String apiKey;

    @Value("${nvidia.api.base-url}")
    private String baseUrl;

    @Value("${nvidia.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String callNvidiaAi(String systemPrompt, String userMessage) {
        try {
            WebClient client = WebClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("max_tokens", 1024);
            requestBody.put("temperature", 0.7);

            ArrayNode messages = requestBody.putArray("messages");

            ObjectNode sysMsg = objectMapper.createObjectNode();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);

            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);

            String response = client.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("NVIDIA API Response: {}", response);

            JsonNode responseNode = objectMapper.readTree(response);
            return responseNode
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText("I could not generate a response.");

        } catch (Exception e) {
            logger.error("Error calling NVIDIA API: ", e);
            return "AI service is currently unavailable. Please check your system logs.";
        }
    }

    public Map<String, Object> chat(String message, String context) {
        String systemPrompt = "You are an AI assistant integrated into a personal portfolio website. " +
                "Help visitors learn about the portfolio owner and answer questions about their skills, " +
                "projects, experience, and background. Be professional, helpful, and concise.\n\n" +
                (context != null && !context.isEmpty() ? "Portfolio context:\n" + context : "");

        String reply = callNvidiaAi(systemPrompt, message);

        List<String> suggestions = new ArrayList<>();
        if (message.toLowerCase().contains("improve") || message.toLowerCase().contains("suggest")) {
            suggestions.add("Add more project details with live demos");
            suggestions.add("Include testimonials from colleagues");
            suggestions.add("Add a blog section to showcase thought leadership");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("reply", reply);
        result.put("suggestions", suggestions);
        return result;
    }

    public Map<String, Object> analyze(String section, String content) {
        String systemPrompt = "You are a portfolio review expert. Analyze the given portfolio section and provide " +
                "a JSON response with: analysis (string), improvements (array of objects with area, suggestion, priority fields), " +
                "and score (0-100 integer). Response must be valid JSON only, no extra text.";

        String userMessage = "Analyze this \"" + section + "\" section:\n\n" +
                (content != null && !content.isEmpty() ? content : "This section is currently empty.");

        String raw = callNvidiaAi(systemPrompt, userMessage);

        try {
            int start = raw.indexOf('{');
            int end = raw.lastIndexOf('}');
            if (start >= 0 && end > start) {
                JsonNode parsed = objectMapper.readTree(raw.substring(start, end + 1));
                Map<String, Object> result = new HashMap<>();
                result.put("analysis", parsed.path("analysis").asText("Analysis complete."));
                result.put("score", parsed.path("score").asInt(60));

                List<Map<String, String>> improvements = new ArrayList<>();
                JsonNode improvNode = parsed.path("improvements");
                if (improvNode.isArray()) {
                    for (JsonNode item : improvNode) {
                        Map<String, String> imp = new HashMap<>();
                        imp.put("area", item.path("area").asText(""));
                        imp.put("suggestion", item.path("suggestion").asText(""));
                        imp.put("priority", item.path("priority").asText("medium"));
                        improvements.add(imp);
                    }
                }
                result.put("improvements", improvements);
                return result;
            }
        } catch (Exception e) {
            // fall through
        }

        Map<String, Object> result = new HashMap<>();
        result.put("analysis", raw);
        result.put("score", 50);
        List<Map<String, String>> improvements = new ArrayList<>();
        Map<String, String> imp = new HashMap<>();
        imp.put("area", "Content");
        imp.put("suggestion", "Add more detailed information to this section");
        imp.put("priority", "high");
        improvements.add(imp);
        result.put("improvements", improvements);
        return result;
    }
}
