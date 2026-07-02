import { GraduationCap, Calendar, Users, FileText, TrendingUp, Clock } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore, useScheduleStore } from '@/store/useStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { getGrades } = useGradeStore();
  const { getSchedule } = useScheduleStore();

  const grades = getGrades();
  const schedules = getSchedule();

  const getRoleSpecificData = () => {
    if (!user) return { stats: [], recentItems: [], title: '' };

    switch (user.role) {
      case 'student':
        const studentGrades = getGrades({ studentId: user.id });
        const studentSchedules = getSchedule({ classId: user.classId });
        return {
          stats: [
            { label: '已修课程', value: studentGrades.length, icon: GraduationCap, color: 'bg-blue-500' },
            { label: '优秀课程', value: studentGrades.filter(g => g.gradeLevel === '优秀').length, icon: TrendingUp, color: 'bg-green-500' },
            { label: '本周课程', value: studentSchedules.length, icon: Calendar, color: 'bg-purple-500' },
            { label: '待复核成绩', value: studentGrades.filter(g => g.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
          ],
          recentItems: studentGrades.slice(0, 5),
          title: '我的成绩',
        };
      case 'teacher':
        const teacherGrades = getGrades({ teacherId: user.id });
        const teacherSchedules = getSchedule({ teacherId: user.id });
        return {
          stats: [
            { label: '授课班级', value: [...new Set(teacherSchedules.map(s => s.classId))].length, icon: Users, color: 'bg-blue-500' },
            { label: '待登记成绩', value: teacherSchedules.length - teacherGrades.length, icon: FileText, color: 'bg-orange-500' },
            { label: '已登记成绩', value: teacherGrades.length, icon: GraduationCap, color: 'bg-green-500' },
            { label: '待复核', value: teacherGrades.filter(g => g.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
          ],
          recentItems: teacherGrades.slice(0, 5),
          title: '我登记的成绩',
        };
      case 'homeroom_teacher':
        const classGrades = getGrades({ classId: user.classId });
        const classSchedules = getSchedule({ classId: user.classId });
        return {
          stats: [
            { label: '班级人数', value: [...new Set(classGrades.map(g => g.studentId))].length, icon: Users, color: 'bg-blue-500' },
            { label: '课程总数', value: [...new Set(classSchedules.map(s => s.courseId))].length, icon: Calendar, color: 'bg-purple-500' },
            { label: '待复核成绩', value: classGrades.filter(g => g.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
            { label: '已复核成绩', value: classGrades.filter(g => g.status === 'reviewed').length, icon: GraduationCap, color: 'bg-green-500' },
          ],
          recentItems: classGrades.slice(0, 5),
          title: '班级成绩',
        };
      case 'admin':
      default:
        return {
          stats: [
            { label: '学生总数', value: 4, icon: Users, color: 'bg-blue-500' },
            { label: '课程总数', value: schedules.length, icon: Calendar, color: 'bg-purple-500' },
            { label: '成绩总数', value: grades.length, icon: GraduationCap, color: 'bg-green-500' },
            { label: '待复核', value: grades.filter(g => g.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
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
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {item.score}/{item.fullScore}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.gradeLevel}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    暂无数据
                  </td>
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