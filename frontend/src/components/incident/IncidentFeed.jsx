// src/components/incident/IncidentFeed.jsx
import React, { useEffect, useState } from 'react';
import IncidentCard from './IncidentCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { incidentService } from '../../services/incidentService';

export default function IncidentFeed({ severity = null, limit = 20 }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewFilter] = useState('ACTIVE'); // ACTIVE or ALL

  useEffect(() => {
    let mounted = true;
    const fetchIncidents = async (initial = false) => {
      try {
        if (initial) setLoading(true);

        const data = await incidentService.getIncidents(severity, null, limit * 2);
        if (!mounted) return;

        let filteredIncidents = data.incidents || [];
        
        if (viewFilter === 'ACTIVE') {
          filteredIncidents = filteredIncidents.filter(inc => 
            (inc.status === 'NEW' || inc.status === 'OPEN') &&
            (inc.severity === 'CRITICAL' || inc.severity === 'WARNING')
          ).slice(0, limit);
        } else {
          filteredIncidents = filteredIncidents.slice(0, limit);
        }

        setIncidents(filteredIncidents);
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted && initial) {
          setLoading(false);
        }
      }
    };

    fetchIncidents(true);

    // Open SSE stream for real-time incident pushes
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8080';
    const es = new EventSource(`${backendUrl}/api/layer3/incidents/stream`);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (!mounted) return;
        
        const shouldShow = viewFilter === 'ALL' || 
          ((data.status === 'NEW' || data.status === 'OPEN') &&
           (data.severity === 'CRITICAL' || data.severity === 'WARNING'));
        
        if (shouldShow) {
          setIncidents(prev => {
            const next = [data, ...prev.filter(i => i.session_id !== data.session_id)];
            return next.slice(0, limit);
          });
        }
      } catch (err) {
        console.debug('SSE parse notice', err);
      }
    };
    es.onerror = (err) => {
      console.debug('SSE stream status update', err);
    };

    return () => {
      mounted = false;
      try {
        es.close();
      } catch (err) {
        console.debug('SSE teardown', err);
      }
    };
  }, [severity, limit, viewFilter]);

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm shadow-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!incidents.length ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 py-12 text-center text-slate-500 text-xs italic shadow-sm">
          {viewFilter === 'ACTIVE' ? 'No active threats detected' : 'No incidents found'}
        </div>
      ) : (
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.session_id}
              incident={incident}
            />
          ))}
        </div>
      )}
    </div>
  );
}
