import { useState, useEffect, useCallback } from 'react';
import { Ticket, CreateTicketDTO, UpdateTicketDTO, SystemStatus } from '../types/ticket';
import { api } from '../services/api';

export function useTickets(filters?: { status?: string; category?: string; building?: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const fetchTickets = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await api.getTickets(filters);
      setTickets(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load tickets');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [filters?.status, filters?.category, filters?.building]);

  const fetchStatus = useCallback(async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (e) {
      console.warn('Could not fetch system status', e);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchStatus();

    // Live polling every 3.5 seconds for real-time SLA escalation updates
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [fetchTickets, fetchStatus]);

  const createTicket = async (dto: CreateTicketDTO): Promise<Ticket> => {
    const created = await api.createTicket(dto);
    setTickets(prev => [created, ...prev]);
    return created;
  };

  const updateTicket = async (ticketId: string, dto: UpdateTicketDTO): Promise<Ticket> => {
    const updated = await api.updateTicket(ticketId, dto);
    setTickets(prev => prev.map(t => (t.ticketId === ticketId ? updated : t)));
    return updated;
  };

  return {
    tickets,
    loading,
    error,
    systemStatus,
    refetch: fetchTickets,
    createTicket,
    updateTicket,
  };
}
