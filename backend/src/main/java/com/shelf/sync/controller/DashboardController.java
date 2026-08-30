package com.shelf.sync.controller;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.DashboardStatsResponse;
import com.shelf.sync.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getAdminStats() {
        DashboardStatsResponse stats = dashboardService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.ok("Admin dashboard statistics retrieved successfully", stats));
    }

    @GetMapping("/librarian")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getLibrarianStats() {
        DashboardStatsResponse stats = dashboardService.getLibrarianStats();
        return ResponseEntity.ok(ApiResponse.ok("Librarian dashboard statistics retrieved successfully", stats));
    }

    @GetMapping("/member")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getMemberStats() {
        DashboardStatsResponse stats = dashboardService.getMemberStats();
        return ResponseEntity.ok(ApiResponse.ok("Member dashboard statistics retrieved successfully", stats));
    }
}
