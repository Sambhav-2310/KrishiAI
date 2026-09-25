package com.KrishiAI.Backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ProductImageService {

    /*
     * Store uploaded images inside:
     *
     * <project-folder>/uploads/products/
     */
    private final Path uploadDirectory;


    public ProductImageService() {

        try {

            /*
             * IMPORTANT:
             * Convert the directory to an absolute path first.
             *
             * This fixes the "Invalid image filename"
             * error caused by comparing relative and absolute paths.
             */
            uploadDirectory =
                    Paths.get(
                                    "uploads",
                                    "products"
                            )
                            .toAbsolutePath()
                            .normalize();


            /*
             * Create the directory if it doesn't exist.
             */
            Files.createDirectories(
                    uploadDirectory
            );


            System.out.println(
                    "Product image upload directory: "
                            + uploadDirectory
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to create product image upload directory.",
                    e
            );
        }
    }


    // =========================================================
    // STORE IMAGE
    // =========================================================

    public String storeImage(
            MultipartFile file
    ) {

        /*
         * Check file exists.
         */
        if (file == null ||
                file.isEmpty()) {

            throw new RuntimeException(
                    "Please select an image."
            );
        }


        /*
         * Check content type.
         */
        String contentType =
                file.getContentType();


        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed."
            );
        }


        /*
         * Maximum file size = 5 MB.
         */
        if (file.getSize() >
                5 * 1024 * 1024) {

            throw new RuntimeException(
                    "Image size must be less than 5 MB."
            );
        }


        /*
         * Get original filename.
         */
        String originalFilename =
                file.getOriginalFilename();


        /*
         * Get extension.
         */
        String extension =
                getExtension(
                        originalFilename
                );


        /*
         * Validate extension.
         */
        if (!extension.equals("jpg") &&
                !extension.equals("jpeg") &&
                !extension.equals("png") &&
                !extension.equals("webp")) {

            throw new RuntimeException(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
            );
        }


        /*
         * Generate a unique filename.
         *
         * Example:
         *
         * 8f0d3a5e4c8b4f9b9f7c2a1d3e6a8b12.jpg
         */
        String filename =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        + "."
                        + extension;


        /*
         * Create target path.
         */
        Path target =
                uploadDirectory
                        .resolve(filename)
                        .normalize();


        /*
         * Security check.
         *
         * Make sure the final file is actually
         * inside uploads/products.
         */
        if (!target.startsWith(
                uploadDirectory
        )) {

            throw new RuntimeException(
                    "Invalid image filename."
            );
        }


        /*
         * Save the file.
         */
        try {

            Files.copy(
                    file.getInputStream(),
                    target
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to save product image.",
                    e
            );
        }


        /*
         * Return the URL path.
         *
         * Example:
         *
         * /uploads/products/abc123.jpg
         */
        return "/uploads/products/" +
                filename;
    }


    // =========================================================
    // GET FILE EXTENSION
    // =========================================================

    private String getExtension(
            String filename
    ) {

        if (filename == null ||
                filename.isBlank()) {

            return "";
        }


        int dotIndex =
                filename.lastIndexOf('.');


        if (dotIndex < 0 ||
                dotIndex == filename.length() - 1) {

            return "";
        }


        return filename
                .substring(
                        dotIndex + 1
                )
                .toLowerCase();
    }
}