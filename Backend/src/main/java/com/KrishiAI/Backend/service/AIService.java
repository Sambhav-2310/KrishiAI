package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.PricePredictionRequestDTO;
import com.KrishiAI.Backend.dto.SmartListingRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> generateSmartListing(
            SmartListingRequestDTO request
    ) {

        String url = aiServiceUrl + "/ai/smart-listing";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<SmartListingRequestDTO> entity =
                new HttpEntity<>(request, headers);

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        Map.class
                );

        return response.getBody();
    }

    public Map<String, Object> predictPrice(
            PricePredictionRequestDTO request
    ) {

        String url = aiServiceUrl + "/ai/predict-price";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PricePredictionRequestDTO> entity =
                new HttpEntity<>(request, headers);

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        Map.class
                );

        return response.getBody();
    }

    public Map<String, Object> predictDisease(
            MultipartFile file
    ) {

        String url = aiServiceUrl + "/ai/predict-disease";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        body.add("file", new MultipartInputStreamFileResource(file));

        HttpEntity<MultiValueMap<String, Object>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        Map.class
                );

        return response.getBody();
    }
}