import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useScheduleStore, useGradeStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import {
  DAYS,
  PERIODS,
  PERIOD_TIMES,
  SEMESTER_WEEKS,
  getCurrentWeek,
  getWeekRange,
  isScheduleInWeek,
} from '@/data/mockData';

const courseColors = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
];

const getCourseColor = (courseName: string) => courseColors[courseName.length % courseColors.length];

const ScheduleView = () => {
  const { user } = useAuthStore();
  const { getSchedule } = useScheduleStore();
  const { classes } = useGradeStore();
  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState(user?.classId || 'c001');
  const [week, setWeek] = useState(getCurrentWeek());
  const weekRange = getWeekRange(week);
  const todayIndex = new Date().getDay();

  const rawSchedules = (() => {
    if (user?.role === 'student') return getSchedule({ classId: user.classId });
    if (user?.role === 'teacher') return getSchedule({ teacherId: user.id });
    if (user?.role === 'homeroom_teacher') return getSchedule({ classId: user.classId });
    return getSchedule({ classId: selectedClass || undefined });
  })();

  const schedules = rawSchedules.filter((s) => isScheduleInWeek(s, week));

  const grid: (typeof schedules[0] | null)[][] = Array(PERIODS.length)
    .fill(null)
    .map(() => Array(DAYS.length).fill(null));

  schedules.forEach((schedule) => {
    const dayIndex = schedule.dayOfWeek - 1;
    const periodIndex = schedule.period - 1;
    if (dayIndex >= 0 && dayIndex < DAYS.length && periodIndex >= 0 && periodIndex < PERIODS.length) {
      grid[periodIndex][dayIndex] = schedule;
    }
  });

  return (
    <Layout currentPage="/schedule">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">课表查看</h2>
          <p className="text-gray-500 mt-1">按周查看课程安排</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => navigate('/schedule/arrange')}>
            <Calendar className="w-4 h-4 mr-2" />
            课程安排
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
            disabled={week <= 1}
            onClick={() => setWeek((w) => w - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-medium text-gray-800 min-w-[12rem] text-center">
            第 {week} 周
            <div className="text-xs text-gray-500 font-normal">
              {weekRange.start} ~ {weekRange.end}
            </div>
          </div>
          <button
            type="button"
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"
            disabled={week >= SEMESTER_WEEKS}
            onClick={() => setWeek((w) => w + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Button variant="secondary" size="sm" onClick={() => setWeek(getCurrentWeek())}>
            本周
          </Button>
        </div>
        {user?.role === 'admin' && (
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-3">班级</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部班级</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">节次</th>
                {DAYS.map((day, index) => (
                  <th
                    key={day}
                    className={`px-4 py-3 text-center text-xs font-medium uppercase ${
                      todayIndex === index + 1 ? 'text-primary-700 bg-primary-50' : 'text-gray-500'
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grid.map((row, periodIndex) => (
                <tr key={periodIndex}>
                  <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                    {PERIODS[periodIndex]}
                    <div className="text-xs text-gray-400 font-normal">{PERIOD_TIMES[periodIndex]}</div>
                  </td>
                  {row.map((schedule, dayIndex) => (
                    <td key={dayIndex} className={`px-2 py-2 ${todayIndex === dayIndex + 1 ? 'bg-primary-50/40' : ''}`}>
                      {schedule ? (
                        <div className={`p-2 rounded-lg border text-sm ${getCourseColor(schedule.courseName)}`}>
                          <div className="font-medium truncate">{schedule.courseName}</div>
                          <div className="text-xs truncate">{schedule.teacherName}</div>
                          <div className="text-xs opacity-75">{schedule.classroom}</div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[60px]"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">本周课程列表</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <div key={schedule.id} className={`p-3 rounded-lg border ${getCourseColor(schedule.courseName)}`}>
                <div className="font-medium">{schedule.courseName}</div>
                <div className="text-xs mt-1">
                  {DAYS[schedule.dayOfWeek - 1]} {PERIODS[schedule.period - 1]}
                </div>
                <div className="text-xs mt-1">
                  {schedule.classroom} | {schedule.className}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">本周暂无课程安排</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ScheduleView;
