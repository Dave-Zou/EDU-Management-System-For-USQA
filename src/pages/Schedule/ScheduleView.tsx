import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useScheduleStore, useGradeStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import { addDays, formatISODate, scheduleCoversWeek, startOfWeek } from '@/utils/academic';
import type { Schedule } from '@/types';

const days = ['周一', '周二', '周三', '周四', '周五'];
const periods = ['第1节', '第2节', '第3节', '第4节', '第5节', '第6节'];

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
  const [selectedClass, setSelectedClass] = useState(user?.role === 'admin' ? '' : user?.classId || '');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const schedules = useMemo(() => {
    const scoped =
      user?.role === 'student'
        ? getSchedule({ classId: user.classId })
        : user?.role === 'teacher'
          ? getSchedule({ teacherId: user.id })
          : user?.role === 'homeroom_teacher'
            ? getSchedule({ classId: user.classId })
            : getSchedule(selectedClass ? { classId: selectedClass } : undefined);
    return scoped.filter((item) => scheduleCoversWeek(item, weekStart));
  }, [getSchedule, selectedClass, user, weekStart]);

  const grid = useMemo(() => {
    const cells: Schedule[][][] = Array.from({ length: periods.length }, () =>
      Array.from({ length: days.length }, () => [])
    );
    schedules.forEach((schedule) => {
      const dayIndex = schedule.dayOfWeek - 1;
      const periodIndex = schedule.period - 1;
      if (dayIndex >= 0 && dayIndex < days.length && periodIndex >= 0 && periodIndex < periods.length) {
        cells[periodIndex][dayIndex].push(schedule);
      }
    });
    return cells;
  }, [schedules]);

  const weekLabel = `${formatISODate(weekStart)} 至 ${formatISODate(addDays(weekStart, 6))}`;

  return (
    <Layout currentPage="/schedule">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">课表查看</h2>
          <p className="text-gray-500 mt-1">
            {user?.role === 'teacher' ? '查看个人授课课表' : user?.role === 'student' ? '查看本班课表' : '查看课程安排'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => navigate('/schedule/arrange')}>
            <Calendar className="w-4 h-4 mr-2" />
            课程安排
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
        {user?.role === 'admin' && (
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-4">班级</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部班级</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2 md:ml-auto">
          <Button variant="secondary" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一周
          </Button>
          <button className="text-sm text-gray-700 min-w-[11rem] text-center" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            {weekLabel}
          </button>
          <Button variant="secondary" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            下一周
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">节次</th>
                {days.map((day) => (
                  <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grid.map((row, periodIndex) => (
                <tr key={periods[periodIndex]}>
                  <td className="px-4 py-3 text-sm text-gray-600 font-medium">{periods[periodIndex]}</td>
                  {row.map((items, dayIndex) => (
                    <td key={days[dayIndex]} className="px-2 py-2 align-top">
                      {items.length > 0 ? (
                        <div className="space-y-1">
                          {items.map((schedule) => (
                            <div key={schedule.id} className={`p-2 rounded-lg border text-sm ${getCourseColor(schedule.courseName)}`}>
                              <div className="font-medium truncate">{schedule.courseName}</div>
                              <div className="text-xs truncate">{schedule.teacherName}</div>
                              <div className="text-xs opacity-75 truncate">{schedule.classroom} · {schedule.className}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="min-h-[60px]"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {schedules.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">这一周没有课程。学期范围外的周次会是空的，可以切回本周。</p>
      )}
    </Layout>
  );
};

export default ScheduleView;
