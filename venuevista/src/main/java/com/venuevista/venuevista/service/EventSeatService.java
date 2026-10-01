package com.venuevista.venuevista.service;

import com.venuevista.venuevista.dto.SeatMapResponse;
import com.venuevista.venuevista.repository.EventSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EventSeatService {

    @Autowired
    private EventSeatRepository eventSeatRepository;

    public List<SeatMapResponse> getSeatsByEvent(Long eventId) {

        List<Object[]> results =
                eventSeatRepository.findSeatMapByEvent(eventId);

        List<SeatMapResponse> seatMap = new ArrayList<>();

        for (Object[] row : results) {

            SeatMapResponse seat = new SeatMapResponse(
                    ((Number) row[0]).longValue(),
                    ((Number) row[1]).longValue(),
                    ((Number) row[2]).longValue(),
                    (String) row[5],
                    (String) row[7],
                    (String) row[8],
                    (String) row[6],
                    ((Number) row[4]).doubleValue(),
                    (String) row[3]
            );

            seatMap.add(seat);
        }

        return seatMap;
    }
}