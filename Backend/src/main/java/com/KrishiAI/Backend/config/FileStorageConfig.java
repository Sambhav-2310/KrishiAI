package com.KrishiAI.Backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        Path uploadPath = Paths
                .get("uploads")
                .toAbsolutePath()
                .normalize();

        String uploadLocation =
                uploadPath.toUri().toString();

        if (!uploadLocation.endsWith("/")) {
            uploadLocation += "/";
        }

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);
    }
}