package com.KrishiAI.Backend.service;

import org.springframework.core.io.InputStreamResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public class MultipartInputStreamFileResource
        extends InputStreamResource {

    private final String filename;

    public MultipartInputStreamFileResource(
            MultipartFile file
    ) {
        super(getInputStream(file));
        this.filename = file.getOriginalFilename();
    }

    private static java.io.InputStream getInputStream(
            MultipartFile file
    ) {
        try {
            return file.getInputStream();
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not read uploaded image",
                    e
            );
        }
    }

    @Override
    public String getFilename() {
        return filename;
    }

    @Override
    public long contentLength() {
        return -1;
    }
}