import { GraduationCap, Calendar, Users, FileText, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore, useExamStore, useAppealStore } from '@/store/useStore';
import { GradeStatusBadge } from '@/components/StatusBadge/StatusBadge';
import { EXAM_TYPE_LABELS } from '@/utils/labels';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { getGrades, users, courses, getSchedule } = useGradeStore();
  const { getExams } = useExamStore();
  const { getAppeals } = useAppealStore();
  const navigate = useNavigate();

  const grades = getGrades();

  const getRoleSpecificData = () => {
    if (!user) return { stats: [], recentItems: grades.slice(0, 5), title: '', exams: [] as ReturnType<typeof getExams> };

    const upcomingExams = getExams().filter((e) => e.examDate >= new Date().toISOString().slice(0, 10));

    switch (user.role) {
      case 'student': {
        const studentGrades = getGrades({ studentId: user.id });
        const studentSchedules = getSchedule({ classId: user.classId });
        const reviewed = studentGrades.filter((g) => g.status === 'reviewed');
        const avg =
          reviewed.length > 0
            ? Math.round(reviewed.reduce((sum, g) => sum + (g.score / g.fullScore) * 100, 0) / reviewed.length)
            : 0;
        return {
          stats: [
            { label: '已修课程', value: studentGrades.length, icon: GraduationCap, color: 'bg-blue-500' },
            { label: '优秀课程', value: studentGrades.filter((g) => g.gradeLevel === '优秀').length, icon: TrendingUp, color: 'bg-green-500' },
            { label: '本周课程', value: studentSchedules.length, icon: Calendar, color: 'bg-purple-500' },
            { label: '平均分', value: reviewed.length ? avg : '-', icon: Clock, color: 'bg-yellow-500' },
          ],
          recentItems: studentGrades.slice(0, 5),
          title: '我的成绩',
          exams: upcomingExams.filter((e) => e.classId === user.classId).slice(0, 3),
        };
      }
      case 'teacher': {
        const teacherGrades = getGrades({ teacherId: user.id });
        const teacherSchedules = getSchedule({ teacherId: user.id });
        const taughtPairs = new Set(teacherSchedules.map((s) => `${s.classId}-${s.courseId}`));
        const gradedPairs = new Set(teacherGrades.map((g) => `${g.classId}-${g.courseId}`));
        const pendingRegister = [...taughtPairs].filter((key) => !gradedPairs.has(key)).length;
        return {
          stats: [
            { label: '授课班级', value: new Set(teacherSchedules.map((s) => s.classId)).size, icon: Users, color: 'bg-blue-500' },
            { label: '待登记课程', value: pendingRegister, icon: FileText, color: 'bg-orange-500' },
            { label: '已登记成绩', value: teacherGrades.length, icon: GraduationCap, color: 'bg-green-500' },
            { label: '待复核', value: teacherGrades.filter((g) => g.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
          ],
          recentItems: teacherGrades.slice(0, 5),
          title: '我登记的成绩',
          exams: upcomingExams.filter((e) => e.teacherId === user.id).slice(0, 3),
        };
      }
      case 'homeroom_teacher': {
        const classGrades = getGrades({ classId: user.classId });
        const classSchedules = getSchedule({ classId: user.classId });
        const classSize = users.filter((u) => u.role === 'student' && u.classId === user.classId).length;
        return {
          stats: [
            { label: '班级人数', value: classSize, icon: Users, color: 'bg-blue-500' },
            { label: '课程总数', value: new Set(classSchedules.map((s) => s.courseId)).size, icon: Calendar, color: 'bg-purple-500' },
            { label: '待复核成绩', value: classGrades.filter((g) => g.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
            { label: '待审申诉', value: getAppeals({ classId: user.classId, status: 'pending' }).length, icon: FileText, color: 'bg-orange-500' },
          ],
          recentItems: classGrades.slice(0, 5),
          title: '班级成绩',
          exams: upcomingExams.filter((e) => e.classId === user.classId).slice(0, 3),
        };
      }
      default:
        return {
          stats: [
            { label: '学生总数', value: users.filter((u) => u.role === 'student').length, icon: Users, color: 'bg-blue-500' },
            { label: '课程总数', value: courses.length, icon: Calendar, color: 'bg-purple-500' },
            { label: '成绩总数', value: grades.length, icon: GraduationCap, color: 'bg-green-500' },
            { label: '待复核', value: grades.filter((g) => g.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
          ],
          recentItems: grades.slice(0, 5),
          title: '最近成绩',
          exams: upcomingExams.slice(0, 3),
        };
    }
  };

  const { stats, recentItems, title, exams } = getRoleSpecificData();

  return (
    <Layout currentPage="/dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">欢迎回来，{user?.name}</h2>
        <p className="text-gray-500 mt-1">这是您的首页概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              type="button"
              onClick={() => navigate('/grades')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              查看全部 <ArrowRight className="w-4 h-4 ml-1" />
            </button>
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
                      <td className="px-6 py-4">
                        <GradeStatusBadge status={item.status} />
                      </td>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">即将考试</h3>
            <button
              type="button"
              onClick={() => navigate('/exam')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              全部
            </button>
          </div>
          <div className="p-4 space-y-3">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <div key={exam.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <p className="font-medium text-gray-800">{exam.courseName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {EXAM_TYPE_LABELS[exam.examType]} · {exam.examDate} {exam.startTime}
                  </p>
                  <p className="text-xs text-gray-500">{exam.classroom} · {exam.className}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">暂无即将到来的考试</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
