package com.venuevista.venuevista.controller;

import com.venuevista.venuevista.dto.SeatMapResponse;
import com.venuevista.venuevista.service.EventSeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-seats")
@CrossOrigin
public class EventSeatController {

    @Autowired
    private EventSeatService eventSeatService;

    @GetMapping("/event/{eventId}")
    public List<SeatMapResponse> getSeatsByEvent(
            @PathVariable Long eventId) {

        return eventSeatService.getSeatsByEvent(eventId);
    }
}