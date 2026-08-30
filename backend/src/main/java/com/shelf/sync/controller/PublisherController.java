package com.shelf.sync.controller;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.PublisherDTO;
import com.shelf.sync.service.PublisherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publishers")
public class PublisherController {

    @Autowired
    private PublisherService publisherService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PublisherDTO>>> getAllPublishers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PublisherDTO> publishers = publisherService.getAllPublishers(search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Publishers retrieved successfully", publishers));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<PublisherDTO>>> getAllPublishersList() {
        List<PublisherDTO> publishers = publisherService.getAllPublishersList();
        return ResponseEntity.ok(ApiResponse.ok("All publishers retrieved successfully", publishers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PublisherDTO>> getPublisherById(@PathVariable Long id) {
        PublisherDTO publisher = publisherService.getPublisherById(id);
        return ResponseEntity.ok(ApiResponse.ok("Publisher retrieved successfully", publisher));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<PublisherDTO>> createPublisher(@Valid @RequestBody PublisherDTO dto) {
        PublisherDTO created = publisherService.createPublisher(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Publisher created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<PublisherDTO>> updatePublisher(
            @PathVariable Long id,
            @Valid @RequestBody PublisherDTO dto) {
        PublisherDTO updated = publisherService.updatePublisher(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Publisher updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<Void>> deletePublisher(@PathVariable Long id) {
        publisherService.deletePublisher(id);
        return ResponseEntity.ok(ApiResponse.ok("Publisher deleted successfully", null));
    }
}
