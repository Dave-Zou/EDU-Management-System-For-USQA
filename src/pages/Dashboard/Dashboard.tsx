import { GraduationCap, Calendar, Users, FileText, TrendingUp, Clock } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore, useScheduleStore } from '@/store/useStore';
import { scheduleCoversWeek, startOfWeek } from '@/utils/academic';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { getGrades, users, courses } = useGradeStore();
  const { getSchedule } = useScheduleStore();
  const weekStart = startOfWeek(new Date());

  const grades = getGrades();
  const students = users.filter((item) => item.role === 'student');

  const getRoleSpecificData = () => {
    if (!user) return { stats: [], recentItems: [], title: '' };

    switch (user.role) {
      case 'student': {
        const studentGrades = getGrades({ studentId: user.id });
        const studentSchedules = getSchedule({ classId: user.classId }).filter((item) =>
          scheduleCoversWeek(item, weekStart)
        );
        return {
          stats: [
            { label: '已修课程', value: studentGrades.length, icon: GraduationCap, color: 'bg-blue-500' },
            { label: '优秀课程', value: studentGrades.filter((grade) => grade.gradeLevel === '优秀').length, icon: TrendingUp, color: 'bg-green-500' },
            { label: '本周课程', value: studentSchedules.length, icon: Calendar, color: 'bg-purple-500' },
            { label: '待复核成绩', value: studentGrades.filter((grade) => grade.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
          ],
          recentItems: studentGrades.slice(0, 5),
          title: '我的成绩',
        };
      }
      case 'teacher': {
        const teacherGrades = getGrades({ teacherId: user.id });
        const teacherSchedules = getSchedule({ teacherId: user.id });
        const slots = new Map<string, { classId: string; courseId: string }>();
        teacherSchedules.forEach((item) => {
          slots.set(`${item.classId}-${item.courseId}`, { classId: item.classId, courseId: item.courseId });
        });
        let missing = 0;
        slots.forEach((slot) => {
          const classStudents = students.filter((item) => item.classId === slot.classId);
          const recorded = new Set(
            teacherGrades
              .filter((grade) => grade.classId === slot.classId && grade.courseId === slot.courseId && grade.status !== 'rejected')
              .map((grade) => grade.studentId)
          );
          if (classStudents.some((item) => !recorded.has(item.id))) missing += 1;
        });
        return {
          stats: [
            { label: '授课班级', value: new Set(teacherSchedules.map((item) => item.classId)).size, icon: Users, color: 'bg-blue-500' },
            { label: '待登记班级课程', value: missing, icon: FileText, color: 'bg-orange-500' },
            { label: '已登记成绩', value: teacherGrades.length, icon: GraduationCap, color: 'bg-green-500' },
            { label: '待复核', value: teacherGrades.filter((grade) => grade.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
          ],
          recentItems: teacherGrades.slice(0, 5),
          title: '我登记的成绩',
        };
      }
      case 'homeroom_teacher': {
        const classGrades = getGrades({ classId: user.classId });
        const classSchedules = getSchedule({ classId: user.classId });
        const classSize = students.filter((item) => item.classId === user.classId).length;
        return {
          stats: [
            { label: '班级人数', value: classSize, icon: Users, color: 'bg-blue-500' },
            { label: '课程总数', value: new Set(classSchedules.map((item) => item.courseId)).size, icon: Calendar, color: 'bg-purple-500' },
            { label: '待复核成绩', value: classGrades.filter((grade) => grade.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
            { label: '已复核成绩', value: classGrades.filter((grade) => grade.status === 'reviewed').length, icon: GraduationCap, color: 'bg-green-500' },
          ],
          recentItems: classGrades.slice(0, 5),
          title: '班级成绩',
        };
      }
      case 'admin':
      default:
        return {
          stats: [
            { label: '学生总数', value: students.length, icon: Users, color: 'bg-blue-500' },
            { label: '课程总数', value: courses.length, icon: Calendar, color: 'bg-purple-500' },
            { label: '成绩总数', value: grades.length, icon: GraduationCap, color: 'bg-green-500' },
            { label: '待复核', value: grades.filter((grade) => grade.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
          ],
          recentItems: grades.slice(0, 5),
          title: '最近成绩',
        };
    }
  };

  const { stats, recentItems, title } = getRoleSpecificData();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">待复核</span>;
      case 'reviewed':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">已复核</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">已驳回</span>;
      default:
        return null;
    }
  };

  return (
    <Layout currentPage="/dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">欢迎回来，{user?.name}</h2>
        <p className="text-gray-500 mt-1">这是您的首页概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学生</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成绩</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{item.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.score}/{item.fullScore}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.gradeLevel}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
