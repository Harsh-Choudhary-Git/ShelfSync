package com.shelf.sync.controller;

import com.shelf.sync.dto.ApiResponse;
import com.shelf.sync.dto.SystemSettingDTO;
import com.shelf.sync.service.SettingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingController {

    @Autowired
    private SettingService settingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemSettingDTO>>> getAllSettings() {
        List<SystemSettingDTO> settings = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.ok("System settings retrieved successfully", settings));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicSettings() {
        Map<String, Object> publicSettings = Map.of(
                "borrowDurationDays", settingService.getBorrowDurationDays(),
                "finePerDay", settingService.getFinePerDay(),
                "maxActiveLoans", settingService.getMaxActiveLoansPerMember()
        );
        return ResponseEntity.ok(ApiResponse.ok("Public library rules retrieved successfully", publicSettings));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemSettingDTO>> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody SystemSettingDTO dto) {
        SystemSettingDTO updated = settingService.updateSetting(key, dto.getSettingValue(), dto.getDescription());
        return ResponseEntity.ok(ApiResponse.ok("Setting '" + key + "' updated successfully", updated));
    }
}
