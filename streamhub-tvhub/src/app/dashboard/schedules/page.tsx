/**
 * Schedules Page - Videotron (Enhanced with Form & Calendar View)
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  name: string;
  screenGroup: string;
  playlist: string;
  dateStart: string;
  dateEnd: string;
  timeStart: string;
  timeEnd: string;
  repeat: 'none' | 'daily' | 'weekdays' | 'weekends' | 'weekly';
  status: 'active' | 'paused';
}

interface CalendarSlot {
  time: string;
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Promo Morning',
      screenGroup: 'Lobby TVs',
      playlist: 'Promo Morning',
      dateStart: '2026-06-01',
      dateEnd: '2026-06-30',
      timeStart: '08:00',
      timeEnd: '12:00',
      repeat: 'weekdays',
      status: 'active',
    },
    {
      id: '2',
      name: 'Afternoon Ads',
      screenGroup: 'Food Court',
      playlist: 'Lunch Specials',
      dateStart: '2026-06-01',
      dateEnd: '2026-06-30',
      timeStart: '12:00',
      timeEnd: '16:00',
      repeat: 'daily',
      status: 'active',
    },
  ]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    screenGroup: '',
    playlist: '',
    dateStart: '',
    dateEnd: '',
    timeStart: '',
    timeEnd: '',
    repeat: 'none' as Schedule['repeat'],
  });

  const screenGroups = ['Lobby TVs', 'Food Court', 'Cinema', 'Meeting Rooms', 'All Screens'];
  const playlists = ['Promo Morning', 'Lunch Specials', 'Evening Entertainment', 'Kids Content', 'News Updates'];

  const handleAddSchedule = () => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      ...formData,
      status: 'active',
    };
    setSchedules([...schedules, newSchedule]);
    setAddDialogOpen(false);
    setFormData({
      name: '',
      screenGroup: '',
      playlist: '',
      dateStart: '',
      dateEnd: '',
      timeStart: '',
      timeEnd: '',
      repeat: 'none',
    });
    toast.success('Schedule created successfully');
  };

  const handleEditSchedule = () => {
    if (selectedSchedule) {
      setSchedules(schedules.map(s =>
        s.id === selectedSchedule.id
          ? { ...s, ...formData }
          : s
      ));
      setEditDialogOpen(false);
      setSelectedSchedule(null);
      setFormData({
        name: '',
        screenGroup: '',
        playlist: '',
        dateStart: '',
        dateEnd: '',
        timeStart: '',
        timeEnd: '',
        repeat: 'none',
      });
      toast.success('Schedule updated successfully');
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast.success('Schedule deleted successfully');
  };

  const toggleStatus = (id: string) => {
    setSchedules(schedules.map(s =>
      s.id === id
        ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
        : s
    ));
    toast.success('Schedule status toggled');
  };

  const openEditDialog = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      name: schedule.name,
      screenGroup: schedule.screenGroup,
      playlist: schedule.playlist,
      dateStart: schedule.dateStart,
      dateEnd: schedule.dateEnd,
      timeStart: schedule.timeStart,
      timeEnd: schedule.timeEnd,
      repeat: schedule.repeat,
    });
    setEditDialogOpen(true);
  };

  // Generate calendar slots
  const generateCalendarSlots = (): CalendarSlot[] => {
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return timeSlots.map(time => {
      const slot: CalendarSlot = { time, monday: null, tuesday: null, wednesday: null, thursday: null, friday: null };

      schedules.forEach(schedule => {
        if (schedule.status === 'active' && time >= schedule.timeStart && time < schedule.timeEnd) {
          const shouldApply =
            schedule.repeat === 'daily' ||
            (schedule.repeat === 'weekdays') ||
            (schedule.repeat === 'none');

          if (shouldApply) {
            if (!slot.monday) slot.monday = schedule.name.charAt(0);
            if (!slot.tuesday) slot.tuesday = schedule.name.charAt(0);
            if (!slot.wednesday) slot.wednesday = schedule.name.charAt(0);
            if (!slot.thursday) slot.thursday = schedule.name.charAt(0);
            if (!slot.friday) slot.friday = schedule.name.charAt(0);
          }
        }
      });

      return slot;
    });
  };

  const calendarSlots = generateCalendarSlots();
  const activeCount = schedules.filter(s => s.status === 'active').length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Schedules
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage content scheduling across screens
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground">
              Total schedules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screen Groups</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{screenGroups.length}</div>
            <p className="text-xs text-muted-foreground">
              Targeted groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playlists</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playlists.length}</div>
            <p className="text-xs text-muted-foreground">
              Available playlists
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Management with Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>Weekly calendar view</CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Schedule</DialogTitle>
                  <DialogDescription>
                    Set up content scheduling for your screens
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Screen Group</label>
                    <Select value={formData.screenGroup} onValueChange={(value) => setFormData({ ...formData, screenGroup: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select screen group" />
                      </SelectTrigger>
                      <SelectContent>
                        {screenGroups.map((group) => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Playlist</label>
                    <Select value={formData.playlist} onValueChange={(value) => setFormData({ ...formData, playlist: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select playlist" />
                      </SelectTrigger>
                      <SelectContent>
                        {playlists.map((playlist) => (
                          <SelectItem key={playlist} value={playlist}>{playlist}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={formData.dateStart}
                        onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={formData.dateEnd}
                        onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <Input
                        type="time"
                        value={formData.timeStart}
                        onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <Input
                        type="time"
                        value={formData.timeEnd}
                        onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Repeat</label>
                    <Select value={formData.repeat} onValueChange={(value: any) => setFormData({ ...formData, repeat: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select repeat option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddSchedule}>Save Schedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar View */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                  <th className="text-center py-3 px-4 font-medium">Mon</th>
                  <th className="text-center py-3 px-4 font-medium">Tue</th>
                  <th className="text-center py-3 px-4 font-medium">Wed</th>
                  <th className="text-center py-3 px-4 font-medium">Thu</th>
                  <th className="text-center py-3 px-4 font-medium">Fri</th>
                </tr>
              </thead>
              <tbody>
                {calendarSlots.map((slot, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 font-medium text-sm">{slot.time}</td>
                    <td className="text-center py-3 px-4">
                      {slot.monday ? (
                        <Badge variant="default" className="bg-blue-500">{slot.monday}</Badge>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {slot.tuesday ? (
                        <Badge variant="default" className="bg-blue-500">{slot.tuesday}</Badge>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {slot.wednesday ? (
                        <Badge variant="default" className="bg-blue-500">{slot.wednesday}</Badge>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {slot.thursday ? (
                        <Badge variant="default" className="bg-blue-500">{slot.thursday}</Badge>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {slot.friday ? (
                        <Badge variant="default" className="bg-blue-500">{slot.friday}</Badge>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Schedule List */}
          <div className="mt-6">
            <h3 className="font-medium mb-3">All Schedules</h3>
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{schedule.name}</p>
                      <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                        {schedule.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{schedule.screenGroup}</span>
                      <span>→</span>
                      <span>{schedule.playlist}</span>
                      <span>|</span>
                      <span>{schedule.dateStart} - {schedule.dateEnd}</span>
                      <span>|</span>
                      <span>{schedule.timeStart} - {schedule.timeEnd}</span>
                      <span>|</span>
                      <span className="capitalize">{schedule.repeat}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(schedule.id)}
                    >
                      {schedule.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(schedule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update schedule configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Screen Group</label>
              <Select value={formData.screenGroup} onValueChange={(value) => setFormData({ ...formData, screenGroup: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {screenGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Playlist</label>
              <Select value={formData.playlist} onValueChange={(value) => setFormData({ ...formData, playlist: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist} value={playlist}>{playlist}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.dateStart}
                  onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.dateEnd}
                  onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={formData.timeStart}
                  onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={formData.timeEnd}
                  onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Repeat</label>
              <Select value={formData.repeat} onValueChange={(value: any) => setFormData({ ...formData, repeat: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
