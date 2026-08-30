package com.shelf.sync.controller;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.FineResponse;
import com.shelf.sync.dto.PayFineRequest;
import com.shelf.sync.entity.FineStatus;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.exception.UnauthorizedException;
import com.shelf.sync.service.AuthService;
import com.shelf.sync.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    @Autowired
    private FineService fineService;

    @Autowired
    private AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<Page<FineResponse>>> getAllFines(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) FineStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FineResponse> fines = fineService.searchFines(memberId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Fines retrieved successfully", fines));
    }

    @GetMapping("/my-fines")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<Page<FineResponse>>> getMyFines(
            @RequestParam(required = false) FineStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        User currentUser = authService.getCurrentUserEntity();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FineResponse> fines = fineService.searchFines(currentUser.getId(), status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("My fines retrieved successfully", fines));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FineResponse>> getFineById(@PathVariable Long id) {
        FineResponse fine = fineService.getFineById(id);
        User currentUser = authService.getCurrentUserEntity();

        if (currentUser.getRole() == Role.ROLE_MEMBER && !fine.getMember().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view this fine");
        }

        return ResponseEntity.ok(ApiResponse.ok("Fine details retrieved successfully", fine));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FineResponse>> payFine(
            @PathVariable Long id,
            @RequestBody(required = false) PayFineRequest request) {
        FineResponse paid = fineService.payFine(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Fine paid successfully", paid));
    }
}
