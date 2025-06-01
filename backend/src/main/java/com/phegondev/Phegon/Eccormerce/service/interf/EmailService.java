package com.phegondev.Phegon.Eccormerce.service.interf;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);
}
