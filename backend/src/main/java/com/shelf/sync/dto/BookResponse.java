package com.shelf.sync.dto;

import com.shelf.sync.entity.Book;
import java.time.LocalDateTime;

public class BookResponse {

    private Long id;
    private String isbn;
    private String title;
    private String description;
    private AuthorDTO author;
    private PublisherDTO publisher;
    private CategoryDTO category;
    private Integer publicationYear;
    private String edition;
    private String language;
    private Integer pages;
    private String coverImageUrl;
    private Integer totalCopies;
    private Integer availableCopies;
    private String locationShelf;
    private boolean available;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BookResponse() {
    }

    public BookResponse(Book book) {
        if (book != null) {
            this.id = book.getId();
            this.isbn = book.getIsbn();
            this.title = book.getTitle();
            this.description = book.getDescription();
            this.author = book.getAuthor() != null ? new AuthorDTO(book.getAuthor()) : null;
            this.publisher = book.getPublisher() != null ? new PublisherDTO(book.getPublisher()) : null;
            this.category = book.getCategory() != null ? new CategoryDTO(book.getCategory()) : null;
            this.publicationYear = book.getPublicationYear();
            this.edition = book.getEdition();
            this.language = book.getLanguage();
            this.pages = book.getPages();
            this.coverImageUrl = book.getCoverImageUrl();
            this.totalCopies = book.getTotalCopies();
            this.availableCopies = book.getAvailableCopies();
            this.locationShelf = book.getLocationShelf();
            this.available = book.getAvailableCopies() != null && book.getAvailableCopies() > 0;
            this.createdAt = book.getCreatedAt();
            this.updatedAt = book.getUpdatedAt();
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AuthorDTO getAuthor() {
        return author;
    }

    public void setAuthor(AuthorDTO author) {
        this.author = author;
    }

    public PublisherDTO getPublisher() {
        return publisher;
    }

    public void setPublisher(PublisherDTO publisher) {
        this.publisher = publisher;
    }

    public CategoryDTO getCategory() {
        return category;
    }

    public void setCategory(CategoryDTO category) {
        this.category = category;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }

    public String getEdition() {
        return edition;
    }

    public void setEdition(String edition) {
        this.edition = edition;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Integer getPages() {
        return pages;
    }

    public void setPages(Integer pages) {
        this.pages = pages;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public Integer getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(Integer totalCopies) {
        this.totalCopies = totalCopies;
    }

    public Integer getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(Integer availableCopies) {
        this.availableCopies = availableCopies;
        this.available = availableCopies != null && availableCopies > 0;
    }

    public String getLocationShelf() {
        return locationShelf;
    }

    public void setLocationShelf(String locationShelf) {
        this.locationShelf = locationShelf;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
