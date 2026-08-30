package com.shelf.sync.dto;

import com.shelf.sync.entity.Author;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthorDTO {

    private Long id;

    @NotBlank(message = "Author name is required")
    @Size(max = 100)
    private String name;

    private String biography;

    @Size(max = 50)
    private String nationality;

    private Integer birthYear;

    public AuthorDTO() {
    }

    public AuthorDTO(Author author) {
        if (author != null) {
            this.id = author.getId();
            this.name = author.getName();
            this.biography = author.getBiography();
            this.nationality = author.getNationality();
            this.birthYear = author.getBirthYear();
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public Integer getBirthYear() {
        return birthYear;
    }

    public void setBirthYear(Integer birthYear) {
        this.birthYear = birthYear;
    }
}
