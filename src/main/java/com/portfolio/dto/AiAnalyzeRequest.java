package com.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiAnalyzeRequest {
    @NotBlank(message = "Section is required")
    private String section;

    private String content;
}
