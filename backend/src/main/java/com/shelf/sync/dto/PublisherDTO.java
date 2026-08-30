package com.shelf.sync.dto;

import com.shelf.sync.entity.Publisher;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PublisherDTO {

    private Long id;

    @NotBlank(message = "Publisher name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 255)
    private String address;

    @Size(max = 255)
    private String website;

    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    public PublisherDTO() {
    }

    public PublisherDTO(Publisher publisher) {
        if (publisher != null) {
            this.id = publisher.getId();
            this.name = publisher.getName();
            this.address = publisher.getAddress();
            this.website = publisher.getWebsite();
            this.email = publisher.getEmail();
            this.phone = publisher.getPhone();
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
