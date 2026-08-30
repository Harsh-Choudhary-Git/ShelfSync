package com.shelf.sync.service;

import com.shelf.sync.dto.PublisherDTO;
import com.shelf.sync.entity.Publisher;
import com.shelf.sync.exception.ResourceNotFoundException;
import com.shelf.sync.repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublisherService {

    @Autowired
    private PublisherRepository publisherRepository;

    @Transactional(readOnly = true)
    public Page<PublisherDTO> getAllPublishers(String search, Pageable pageable) {
        return publisherRepository.searchPublishers(search, pageable)
                .map(PublisherDTO::new);
    }

    @Transactional(readOnly = true)
    public List<PublisherDTO> getAllPublishersList() {
        return publisherRepository.findAll().stream()
                .map(PublisherDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PublisherDTO getPublisherById(Long id) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publisher not found with id: " + id));
        return new PublisherDTO(publisher);
    }

    @Transactional
    public PublisherDTO createPublisher(PublisherDTO dto) {
        Publisher publisher = new Publisher(
                dto.getName().trim(),
                dto.getAddress(),
                dto.getWebsite(),
                dto.getEmail(),
                dto.getPhone()
        );
        Publisher saved = publisherRepository.save(publisher);
        return new PublisherDTO(saved);
    }

    @Transactional
    public PublisherDTO updatePublisher(Long id, PublisherDTO dto) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publisher not found with id: " + id));

        publisher.setName(dto.getName().trim());
        publisher.setAddress(dto.getAddress());
        publisher.setWebsite(dto.getWebsite());
        publisher.setEmail(dto.getEmail());
        publisher.setPhone(dto.getPhone());

        Publisher updated = publisherRepository.save(publisher);
        return new PublisherDTO(updated);
    }

    @Transactional
    public void deletePublisher(Long id) {
        if (!publisherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Publisher not found with id: " + id);
        }
        publisherRepository.deleteById(id);
    }
}
