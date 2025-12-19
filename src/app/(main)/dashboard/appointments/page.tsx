'use client';

import React, { useState } from "react";
import useSWR from "swr";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Phone, 
  User, 
  MapPin, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  Bot,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  date: string;
  duration: number;
  status: string;
  serviceType: string | null;
  address: string | null;
  notes: string | null;
  bookedVia: string;
  createdAt: string;
}

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { data, isLoading, mutate } = useSWR<{
    appointments: Appointment[];
    stats: {
      total: number;
      today: number;
      thisWeek: number;
      confirmed: number;
      cancelled: number;
    };
  }>("/api/appointments", fetcher, { refreshInterval: 30000 });

  const appointments = data?.appointments || [];
  const stats = data?.stats || { total: 0, today: 0, thisWeek: 0, confirmed: 0, cancelled: 0 };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchQuery || 
      apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customerPhone?.includes(searchQuery) ||
      apt.serviceType?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((groups: Record<string, Appointment[]>, apt) => {
    const dateKey = format(parseISO(apt.date), 'yyyy-MM-dd');
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(apt);
    return groups;
  }, {});

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMMM d");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'CANCELLED': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'NO_SHOW': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      mutate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Stats */}
      <div className="grid grid-cols-5 gap-px bg-border border-b">
        <StatCard 
          label="Today" 
          value={stats.today} 
          icon={Calendar} 
          color="text-blue-500"
          active={true}
        />
        <StatCard 
          label="This Week" 
          value={stats.thisWeek} 
          icon={Clock} 
          color="text-purple-500"
        />
        <StatCard 
          label="Confirmed" 
          value={stats.confirmed} 
          icon={CheckCircle2} 
          color="text-emerald-500"
          onClick={() => setStatusFilter(statusFilter === 'CONFIRMED' ? null : 'CONFIRMED')}
          active={statusFilter === 'CONFIRMED'}
        />
        <StatCard 
          label="Cancelled" 
          value={stats.cancelled} 
          icon={XCircle} 
          color="text-red-500"
          onClick={() => setStatusFilter(statusFilter === 'CANCELLED' ? null : 'CANCELLED')}
          active={statusFilter === 'CANCELLED'}
        />
        <StatCard 
          label="Total" 
          value={stats.total} 
          icon={User} 
          color="text-muted-foreground"
          onClick={() => setStatusFilter(null)}
          active={!statusFilter}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        {/* Search & Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Appointments List */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No appointments found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Appointments booked via AI Receptionist will appear here
              </p>
            </div>
          ) : (
            Object.entries(groupedAppointments)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, dayAppointments]) => (
                <div key={dateKey}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {getDateLabel(dateKey)}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                    </Badge>
                  </h3>
                  <div className="space-y-3">
                    {dayAppointments
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((apt) => (
                        <AppointmentCard 
                          key={apt.id} 
                          appointment={apt} 
                          onStatusUpdate={handleStatusUpdate}
                        />
                      ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  onClick,
  active 
}: { 
  label: string; 
  value: number; 
  icon: any; 
  color: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div 
      className={cn(
        "bg-card p-4 flex flex-col justify-between gap-2 transition-colors",
        onClick && "cursor-pointer hover:bg-accent/50",
        active && "bg-accent"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <span className="text-2xl font-light tracking-tight">{value}</span>
    </div>
  );
}

function AppointmentCard({ 
  appointment, 
  onStatusUpdate 
}: { 
  appointment: Appointment;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const aptDate = parseISO(appointment.date);
  const isPastAppointment = isPast(aptDate);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'CANCELLED': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'NO_SHOW': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isPastAppointment && appointment.status === 'CONFIRMED' && "border-amber-500/30 bg-amber-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Time & Details */}
          <div className="flex gap-4">
            {/* Time Block */}
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary">
              <span className="text-lg font-bold">{format(aptDate, 'HH:mm')}</span>
              <span className="text-[10px] uppercase">{format(aptDate, 'a')}</span>
            </div>
            
            {/* Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{appointment.customerName}</h4>
                {appointment.bookedVia === 'AI_RECEPTIONIST' && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Bot className="w-3 h-3" />
                    AI Booked
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {appointment.customerPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {appointment.customerPhone}
                  </span>
                )}
                {appointment.serviceType && (
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    {appointment.serviceType}
                  </span>
                )}
                {appointment.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {appointment.address}
                  </span>
                )}
              </div>
              
              {appointment.notes && (
                <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                  {appointment.notes}
                </p>
              )}
            </div>
          </div>
          
          {/* Right: Status & Actions */}
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("capitalize", getStatusColor(appointment.status))}>
              {appointment.status.toLowerCase().replace('_', ' ')}
            </Badge>
            
            {appointment.status === 'CONFIRMED' && (
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                  onClick={() => onStatusUpdate(appointment.id, 'COMPLETED')}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Complete
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10"
                  onClick={() => onStatusUpdate(appointment.id, 'CANCELLED')}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
            
            {isPastAppointment && appointment.status === 'CONFIRMED' && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600">
                <AlertCircle className="w-3 h-3" />
                Needs update
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

