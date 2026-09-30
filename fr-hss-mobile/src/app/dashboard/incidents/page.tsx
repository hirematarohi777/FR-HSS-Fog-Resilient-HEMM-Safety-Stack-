'use client';

import { useState } from 'react';
import { useDemoState } from '@/lib/demo-context';
import { PILLAR_META, PillarId, Incident, IncidentPriority } from '@/lib/types';
import { FileText, Plus, ChevronDown, ChevronUp, Eye, Ear, Compass, Radio, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_USERS } from '@/lib/types';

const PILLAR_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  vision: Eye, acoustic: Ear, magnetic_nav: Compass, v2v: Radio, ebs: ShieldAlert,
};

function priorityConfig(p: IncidentPriority) {
  const map = {
    low: { bg: '#14532D30', color: '#22C55E', border: '#22C55E30', label: 'LOW' },
    medium: { bg: '#78350F30', color: '#F59E0B', border: '#F59E0B30', label: 'MEDIUM' },
    high: { bg: '#7C2D1230', color: '#F97316', border: '#F9731630', label: 'HIGH' },
    critical: { bg: '#7F1D1D30', color: '#EF4444', border: '#EF444430', label: 'CRITICAL' },
  };
  return map[p] || map.medium;
}

function stateColor(s: string) {
  return s === 'nominal' ? '#22C55E' : s === 'degraded' ? '#F97316' : s === 'alert' ? '#EF4444' : '#6B7280';
}

function IncidentCard({ incident, isAdmin }: { incident: Incident; isAdmin: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { addSupervisorNotes, state } = useDemoState();
  const [notes, setNotes] = useState(incident.supervisorNotes || '');
  const [saved, setSaved] = useState(false);
  const pc = priorityConfig(incident.priority);
  const submitter = DEMO_USERS.find(u => u.id === incident.submittedBy);

  const handleSaveNotes = () => {
    addSupervisorNotes(incident.id, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="bg-[#111827] border-[#374151] overflow-hidden" style={{ borderLeft: `4px solid ${pc.color}` }}>
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
                style={{ background: pc.bg, color: pc.color, borderColor: pc.border }}
              >
                {pc.label}
              </span>
              <h3 className="text-sm font-bold text-white">{incident.title}</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#6B7280]">
              <span>By {submitter?.name || incident.submittedBy}</span>
              <span>·</span>
              <span>{new Date(incident.submittedAt).toLocaleString()}</span>
              {incident.vehicleId && (
                <>
                  <span>·</span>
                  <span className="font-mono text-[#06B6D4]">{incident.vehicleId.toUpperCase()}</span>
                </>
              )}
              {incident.segment && (
                <>
                  <span>·</span>
                  <span className="font-mono">{incident.segment}</span>
                </>
              )}
            </div>
          </div>
          {expanded ? <ChevronUp size={16} className="text-[#9CA3AF] flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-[#9CA3AF] flex-shrink-0 mt-1" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-[#374151] pt-4">
          {/* Description */}
          <div>
            <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Description</div>
            <p className="text-sm text-[#E5E7EB]">{incident.description}</p>
          </div>

          {/* Pillar snapshot */}
          {incident.pillarSnapshot.length > 0 && (
            <div>
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-2">
                Pillar Snapshot at Time of Incident
              </div>
              <div className="space-y-2">
                {incident.pillarSnapshot.map(r => {
                  const Icon = PILLAR_ICONS[r.pillarId];
                  const color = stateColor(r.state);
                  return (
                    <div key={r.pillarId} className="flex items-center gap-3 bg-[#1F2937] rounded-lg px-3 py-2">
                      {Icon && <Icon size={14} className={color === '#22C55E' ? 'text-green-500' : color === '#F97316' ? 'text-orange-500' : color === '#EF4444' ? 'text-red-500' : 'text-gray-500'} />}
                      <span className="text-xs text-[#9CA3AF] flex-1 capitalize">
                        {PILLAR_META[r.pillarId as PillarId]?.name || r.pillarId}
                      </span>
                      <div className="w-24 h-1.5 bg-[#374151] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${r.confidence}%`, background: color }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold w-8 text-right" style={{ color }}>
                        {r.confidence}%
                      </span>
                      <span className="text-[10px] uppercase font-bold w-16 text-right" style={{ color }}>
                        {r.state}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#6B7280] italic mt-1">
                Snapshot captured at incident submission time — SIMULATED DATA
              </p>
            </div>
          )}

          {/* Related alerts */}
          {incident.alertIds.length > 0 && (
            <div>
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-2">Related Alerts</div>
              <div className="flex flex-wrap gap-2">
                {incident.alertIds.map(id => {
                  const alert = state.alerts.find(a => a.id === id);
                  return (
                    <span
                      key={id}
                      className="text-[10px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 px-2 py-0.5 rounded font-mono"
                    >
                      {id} {alert ? `— ${alert.status}` : ''}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Supervisor notes */}
          {(isAdmin || state.currentUser?.role === 'supervisor') && (
            <div>
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-2">Supervisor Notes</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-[#1F2937] border border-[#374151] rounded-lg p-3 text-sm text-white placeholder-[#6B7280] resize-none focus:outline-none focus:border-[#06B6D4]"
                rows={3}
                placeholder="Add supervisor notes..."
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] transition-opacity ${saved ? 'opacity-100 text-[#22C55E]' : 'opacity-0'}`}>
                  ✓ Notes saved
                </span>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="bg-[#06B6D4] hover:bg-cyan-600 text-white text-xs h-8"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}

          {incident.supervisorNotes && !(isAdmin || state.currentUser?.role === 'supervisor') && (
            <div>
              <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Supervisor Notes</div>
              <p className="text-sm text-[#9CA3AF] italic bg-[#1F2937] rounded-lg p-3">
                {incident.supervisorNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function IncidentForm({ onDone }: { onDone: () => void }) {
  const { state, submitIncident } = useDemoState();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('medium');
  const [vehicleId, setVehicleId] = useState('');
  const [segment, setSegment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    submitIncident({
      title: title.trim(),
      description: description.trim(),
      priority,
      vehicleId: vehicleId || undefined,
      segment: segment || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      onDone();
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#14532D] flex items-center justify-center mx-auto">
          <FileText size={28} className="text-[#22C55E]" />
        </div>
        <h3 className="text-white font-bold">Incident Submitted</h3>
        <p className="text-sm text-[#9CA3AF]">Visible in Incident History. Pillar snapshot captured.</p>
      </div>
    );
  }

  const inputClass = "w-full bg-[#1F2937] border border-[#374151] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#06B6D4] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Title *</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Brief description of the incident"
          required
        />
      </div>

      <div>
        <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Detailed account of what occurred..."
        />
      </div>

      <div>
        <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Priority</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as IncidentPriority)}
          className={inputClass}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Vehicle (optional)</label>
          <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className={inputClass}>
            <option value="">None</option>
            {state.vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1.5">Segment (optional)</label>
          <select value={segment} onChange={e => setSegment(e.target.value)} className={inputClass}>
            <option value="">None</option>
            {state.segments.map(s => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#164E63] border border-[#06B6D4]/30 rounded-lg p-3">
        <p className="text-[11px] text-[#06B6D4]">
          ℹ Submitting will capture a snapshot of all current pillar readings and link any active alerts to this incident.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#06B6D4] hover:bg-cyan-600 text-white font-semibold h-12"
      >
        <FileText size={16} className="mr-2" />
        Submit Incident
      </Button>
    </form>
  );
}

export default function IncidentsPage() {
  const { state } = useDemoState();
  const [showForm, setShowForm] = useState(false);

  const role = state.currentUser?.role;
  const userId = state.currentUser?.id;
  const isAdmin = role === 'admin';
  const isSupervisor = role === 'supervisor';

  const incidents = role === 'operator'
    ? state.incidents.filter(i => i.submittedBy === userId || i.submittedBy === 'system')
    : state.incidents;

  const sortedIncidents = [...incidents].sort((a, b) => b.submittedAt - a.submittedAt);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Incidents</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            {isSupervisor || isAdmin ? 'All incidents' : 'Your incidents'}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#06B6D4] hover:bg-cyan-600 text-white text-sm h-9"
        >
          <Plus size={16} className="mr-1" />
          Submit
        </Button>
      </div>

      {/* Submit form */}
      {showForm && (
        <Card className="bg-[#111827] border-[#374151] p-5">
          <h3 className="text-sm font-bold text-white mb-4">Submit Incident Report</h3>
          <IncidentForm onDone={() => setShowForm(false)} />
        </Card>
      )}

      {/* Incidents list */}
      <div className="space-y-3">
        {sortedIncidents.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-[#111827] rounded-xl border border-[#374151]">
            <FileText size={48} className="text-[#374151] mb-4" />
            <h3 className="text-white font-medium mb-1">No incidents recorded</h3>
            <p className="text-sm text-[#9CA3AF] max-w-xs">
              Incidents are created during scenario walkthroughs or manually via the form above.
            </p>
          </div>
        ) : (
          sortedIncidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isAdmin={isAdmin || isSupervisor}
            />
          ))
        )}
      </div>
    </div>
  );
}
