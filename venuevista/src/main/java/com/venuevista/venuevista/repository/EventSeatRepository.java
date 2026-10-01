package com.venuevista.venuevista.repository;

import com.venuevista.venuevista.entity.EventSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventSeatRepository
        extends JpaRepository<EventSeat, Long> {

    @Query(value = """
            SELECT
                es.event_seat_id,
                es.event_id,
                es.seat_id,
                es.status,
                es.price,
                vs.seat_number,
                vs.seat_type,
                sr.row_name,
                s.section_name
            FROM event_seats es
            JOIN venue_seats vs
                ON es.seat_id = vs.seat_id
            JOIN seat_rows sr
                ON vs.row_id = sr.row_id
            JOIN sections s
                ON sr.section_id = s.section_id
            WHERE es.event_id = :eventId
            ORDER BY
                s.section_name,
                sr.row_name,
                vs.seat_position
            """,
            nativeQuery = true)
    List<Object[]> findSeatMapByEvent(
            @Param("eventId") Long eventId
    );
}