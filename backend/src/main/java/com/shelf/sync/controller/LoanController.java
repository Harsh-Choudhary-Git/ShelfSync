package com.shelf.sync.controller;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.IssueLoanRequest;
import com.shelf.sync.dto.LoanResponse;
import com.shelf.sync.dto.ReturnLoanRequest;
import com.shelf.sync.entity.LoanStatus;
import com.shelf.sync.entity.Role;
import com.shelf.sync.entity.User;
import com.shelf.sync.exception.UnauthorizedException;
import com.shelf.sync.service.AuthService;
import com.shelf.sync.service.LoanService;
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

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @Autowired
    private AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<Page<LoanResponse>>> getAllLoans(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) LoanStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "issueDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<LoanResponse> loans = loanService.searchLoans(memberId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Loans retrieved successfully", loans));
    }

    @GetMapping("/my-loans")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<Page<LoanResponse>>> getMyLoans(
            @RequestParam(required = false) LoanStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "issueDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        User currentUser = authService.getCurrentUserEntity();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<LoanResponse> loans = loanService.searchLoans(currentUser.getId(), status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("My loans retrieved successfully", loans));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LoanResponse>> getLoanById(@PathVariable Long id) {
        LoanResponse loan = loanService.getLoanById(id);
        User currentUser = authService.getCurrentUserEntity();

        if (currentUser.getRole() == Role.ROLE_MEMBER && !loan.getMember().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view this loan");
        }

        return ResponseEntity.ok(ApiResponse.ok("Loan details retrieved successfully", loan));
    }

    @PostMapping("/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<LoanResponse>> issueBook(@Valid @RequestBody IssueLoanRequest request) {
        LoanResponse response = loanService.issueBook(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Book issued successfully", response));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<LoanResponse>> returnBook(
            @PathVariable Long id,
            @RequestBody(required = false) ReturnLoanRequest request) {
        LoanResponse response = loanService.returnBook(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Book returned successfully", response));
    }

    @PostMapping("/sync-overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<Void>> syncOverdueLoans() {
        loanService.syncOverdueLoans();
        return ResponseEntity.ok(ApiResponse.ok("Overdue loans synchronized", null));
    }
}
