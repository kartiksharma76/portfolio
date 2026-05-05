package com.portfolio.service;

import com.portfolio.dto.ContactRequest;
import com.portfolio.model.ContactMessage;
import com.portfolio.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    public ContactMessage save(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setSubject(request.getSubject());
        message.setMessage(request.getMessage());
        return contactRepository.save(message);
    }

    public List<ContactMessage> getAllMessages() {
        return contactRepository.findAllByOrderByCreatedAtDesc();
    }

    public long getMessageCount() {
        return contactRepository.count();
    }
}
