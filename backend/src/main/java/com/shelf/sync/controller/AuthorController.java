package com.shelf.sync.controller;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.AuthorDTO;
import com.shelf.sync.service.AuthorService;
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
@RequestMapping("/api/authors")
public class AuthorController {

    @Autowired
    private AuthorService authorService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuthorDTO>>> getAllAuthors(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AuthorDTO> authors = authorService.getAllAuthors(search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Authors retrieved successfully", authors));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<AuthorDTO>>> getAllAuthorsList() {
        List<AuthorDTO> authors = authorService.getAllAuthorsList();
        return ResponseEntity.ok(ApiResponse.ok("All authors retrieved successfully", authors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuthorDTO>> getAuthorById(@PathVariable Long id) {
        AuthorDTO author = authorService.getAuthorById(id);
        return ResponseEntity.ok(ApiResponse.ok("Author retrieved successfully", author));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<AuthorDTO>> createAuthor(@Valid @RequestBody AuthorDTO dto) {
        AuthorDTO created = authorService.createAuthor(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Author created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<AuthorDTO>> updateAuthor(
            @PathVariable Long id,
            @Valid @RequestBody AuthorDTO dto) {
        AuthorDTO updated = authorService.updateAuthor(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Author updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<Void>> deleteAuthor(@PathVariable Long id) {
        authorService.deleteAuthor(id);
        return ResponseEntity.ok(ApiResponse.ok("Author deleted successfully", null));
    }
}
