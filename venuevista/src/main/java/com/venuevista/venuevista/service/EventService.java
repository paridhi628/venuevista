package com.venuevista.venuevista.service;

import com.venuevista.venuevista.entity.Event;
import com.venuevista.venuevista.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event updateEvent(Long id, Event event) {

        Event existingEvent = eventRepository.findById(id).orElse(null);

        if (existingEvent != null) {

            existingEvent.setEventName(event.getEventName());
            existingEvent.setDescription(event.getDescription());
            existingEvent.setDate(event.getDate());
            existingEvent.setTime(event.getTime());
            existingEvent.setVenue(event.getVenue());
            existingEvent.setTicketPrice(event.getTicketPrice());

            return eventRepository.save(existingEvent);
        }

        return null;
    }
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}