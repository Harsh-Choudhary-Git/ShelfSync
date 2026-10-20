package com.shelf.sync.dto;

import com.shelf.sync.entity.WishlistItem;
import java.time.LocalDateTime;

public class WishlistResponse {
    private Long id;
    private Long bookId;
    private String title;
    private String authorName;
    private Integer availableCopies;
    private LocalDateTime addedAt;

    public WishlistResponse() {}

    public WishlistResponse(WishlistItem item) {
        this.id = item.getId();
        this.bookId = item.getBook().getId();
        this.title = item.getBook().getTitle();
        this.authorName = item.getBook().getAuthor() != null ? item.getBook().getAuthor().getName() : null;
        this.availableCopies = item.getBook().getAvailableCopies();
        this.addedAt = item.getAddedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public Integer getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(Integer availableCopies) { this.availableCopies = availableCopies; }
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
