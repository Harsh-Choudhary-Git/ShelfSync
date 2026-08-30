package com.shelf.sync.service;

import com.shelf.sync.dto.SystemSettingDTO;
import com.shelf.sync.entity.SystemSetting;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SettingService {

    public static final String KEY_BORROW_DAYS = "DEFAULT_BORROW_DAYS";
    public static final String KEY_FINE_PER_DAY = "FINE_PER_DAY";
    public static final String KEY_MAX_ACTIVE_LOANS = "MAX_ACTIVE_LOANS";

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Value("${app.library.default-borrow-days:14}")
    private int defaultBorrowDays;

    @Value("${app.library.fine-per-day:1.50}")
    private double defaultFinePerDay;

    @Value("${app.library.max-active-loans:5}")
    private int defaultMaxActiveLoans;

    @Transactional(readOnly = true)
    public List<SystemSettingDTO> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(SystemSettingDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public int getBorrowDurationDays() {
        return systemSettingRepository.findBySettingKey(KEY_BORROW_DAYS)
                .map(s -> Integer.parseInt(s.getSettingValue()))
                .orElse(defaultBorrowDays);
    }

    @Transactional(readOnly = true)
    public BigDecimal getFinePerDay() {
        return systemSettingRepository.findBySettingKey(KEY_FINE_PER_DAY)
                .map(s -> new BigDecimal(s.getSettingValue()))
                .orElse(BigDecimal.valueOf(defaultFinePerDay));
    }

    @Transactional(readOnly = true)
    public int getMaxActiveLoansPerMember() {
        return systemSettingRepository.findBySettingKey(KEY_MAX_ACTIVE_LOANS)
                .map(s -> Integer.parseInt(s.getSettingValue()))
                .orElse(defaultMaxActiveLoans);
    }

    @Transactional
    public SystemSettingDTO updateSetting(String key, String value, String description) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseGet(() -> new SystemSetting(key, value, description));

        setting.setSettingValue(value);
        if (description != null) {
            setting.setDescription(description);
        }

        SystemSetting saved = systemSettingRepository.save(setting);
        return new SystemSettingDTO(saved);
    }

    @Transactional
    public void initializeDefaultSettings() {
        if (!systemSettingRepository.existsBySettingKey(KEY_BORROW_DAYS)) {
            systemSettingRepository.save(new SystemSetting(KEY_BORROW_DAYS, String.valueOf(defaultBorrowDays), "Default borrowing duration in days"));
        }
        if (!systemSettingRepository.existsBySettingKey(KEY_FINE_PER_DAY)) {
            systemSettingRepository.save(new SystemSetting(KEY_FINE_PER_DAY, String.valueOf(defaultFinePerDay), "Fine amount charged per day for overdue returns (USD)"));
        }
        if (!systemSettingRepository.existsBySettingKey(KEY_MAX_ACTIVE_LOANS)) {
            systemSettingRepository.save(new SystemSetting(KEY_MAX_ACTIVE_LOANS, String.valueOf(defaultMaxActiveLoans), "Maximum number of active book loans permitted per member"));
        }
    }
}
