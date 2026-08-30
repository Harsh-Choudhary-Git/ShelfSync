package com.shelf.sync.dto;

import com.shelf.sync.entity.SystemSetting;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class SystemSettingDTO {

    private Long id;

    @NotBlank(message = "Setting key is required")
    private String settingKey;

    @NotBlank(message = "Setting value is required")
    private String settingValue;

    private String description;
    private LocalDateTime updatedAt;

    public SystemSettingDTO() {
    }

    public SystemSettingDTO(SystemSetting setting) {
        if (setting != null) {
            this.id = setting.getId();
            this.settingKey = setting.getSettingKey();
            this.settingValue = setting.getSettingValue();
            this.description = setting.getDescription();
            this.updatedAt = setting.getUpdatedAt();
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
