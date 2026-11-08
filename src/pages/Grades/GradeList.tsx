import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Eye, FileText } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore, useAppealStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import Feedback from '@/components/Feedback/Feedback';
import { Grade, GradeStatus } from '@/types';
import { validateScore } from '@/utils/academic';

const PAGE_SIZE = 8;
const statusRank: Record<GradeStatus, number> = { pending: 0, rejected: 1, reviewed: 2 };

const GradeList = () => {
  const { user } = useAuthStore();
  const { getGrades, courses, classes, users } = useGradeStore();
  const { addAppeal, appeals } = useAppealStore();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ classId: '', courseId: '', keyword: '', status: '' });
  const [sortKey, setSortKey] = useState<'studentName' | 'courseName' | 'score' | 'status'>('studentName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [appealData, setAppealData] = useState({ requestedScore: '', reason: '', authCode: '' });
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [appealError, setAppealError] = useState('');

  const grades = useMemo(() => {
    const params: { classId?: string; courseId?: string; studentId?: string; teacherId?: string; status?: GradeStatus } = {};
    if (user?.role === 'student') params.studentId = user.id;
    if (user?.role === 'teacher') params.teacherId = user.id;
    if (user?.role === 'homeroom_teacher' && user.classId) params.classId = user.classId;
    if (user?.role === 'admin' && filters.classId) params.classId = filters.classId;
    if (filters.courseId) params.courseId = filters.courseId;
    if (filters.status) params.status = filters.status as GradeStatus;

    const keyword = filters.keyword.trim().toLowerCase();
    const filtered = getGrades(params).filter((grade) => {
      if (!keyword) return true;
      const student = users.find((item) => item.id === grade.studentId);
      return grade.studentName.toLowerCase().includes(keyword) || (student?.username.toLowerCase().includes(keyword) ?? false);
    });

    return [...filtered].sort((left, right) => {
      const factor = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'score') return (left.score - right.score) * factor;
      if (sortKey === 'status') return (statusRank[left.status] - statusRank[right.status]) * factor;
      return left[sortKey].localeCompare(right[sortKey], 'zh') * factor;
    });
  }, [filters, getGrades, sortDir, sortKey, user, users]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(grades.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleGrades = grades.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  const canEdit = (grade: Grade) => {
    if (user?.role === 'admin') return true;
    return user?.role === 'teacher' && grade.teacherId === user.id && grade.status === 'rejected';
  };

  const hasOpenAppeal = (gradeId: string) =>
    appeals.some((appeal) => appeal.gradeId === gradeId && (appeal.status === 'pending' || appeal.status === 'reviewing'));

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortMark = (key: typeof sortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '');

  const handleAppealSubmit = () => {
    if (!selectedGrade) return;
    setAppealError('');
    const requestedScore = Number(appealData.requestedScore);
    if (!appealData.requestedScore || !appealData.reason.trim() || !appealData.authCode.trim()) {
      setAppealError('请填写完整申诉信息');
      return;
    }
    const scoreError = validateScore(requestedScore, selectedGrade.fullScore);
    if (scoreError) {
      setAppealError(scoreError);
      return;
    }

    const result = addAppeal({
      gradeId: selectedGrade.id,
      studentId: selectedGrade.studentId,
      studentName: selectedGrade.studentName,
      classId: selectedGrade.classId,
      className: selectedGrade.className,
      courseId: selectedGrade.courseId,
      courseName: selectedGrade.courseName,
      teacherId: selectedGrade.teacherId,
      teacherName: selectedGrade.teacherName,
      originalScore: selectedGrade.score,
      requestedScore,
      reason: appealData.reason.trim(),
      authCode: appealData.authCode,
    });

    if (result.ok) {
      setFeedback({ type: 'ok', text: result.message });
      setIsAppealModalOpen(false);
      setAppealData({ requestedScore: '', reason: '', authCode: '' });
      setSelectedGrade(null);
    } else {
      setAppealError(result.message);
    }
  };

  return (
    <Layout currentPage="/grades">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">成绩查询</h2>
          <p className="text-gray-500 mt-1">
            {user?.role === 'student' ? '查看本人成绩' : user?.role === 'teacher' ? '查看本人登记的成绩' : '按条件查看成绩'}
          </p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <Button onClick={() => navigate('/grades/register')}>登记成绩</Button>
        )}
      </div>

      <Feedback feedback={feedback} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">全部班级</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">课程</label>
            <select
              value={filters.courseId}
              onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部课程</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          {user?.role !== 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">学生</label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                placeholder="姓名或学号"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部状态</option>
              <option value="pending">待复核</option>
              <option value="reviewed">已复核</option>
              <option value="rejected">已驳回</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => setFilters({ classId: '', courseId: '', keyword: '', status: '' })}>
            <Search className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button onClick={() => toggleSort('studentName')}>学生{sortMark('studentName')}</button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button onClick={() => toggleSort('courseName')}>课程{sortMark('courseName')}</button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任课老师</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button onClick={() => toggleSort('score')}>成绩{sortMark('score')}</button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button onClick={() => toggleSort('status')}>状态{sortMark('status')}</button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleGrades.length > 0 ? (
                visibleGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.className}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.teacherName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.score}/{grade.fullScore}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.gradeLevel}</td>
                    <td className="px-6 py-4">{getStatusBadge(grade.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { setSelectedGrade(grade); setIsModalOpen(true); }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit(grade) && (
                          <button
                            onClick={() => navigate(`/grades/edit/${grade.id}`)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title={grade.status === 'rejected' ? '重新登记' : '编辑'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {user?.role === 'student' && grade.status === 'reviewed' && !hasOpenAppeal(grade.id) && (
                          <button
                            onClick={() => {
                              setSelectedGrade(grade);
                              setAppealError('');
                              setIsAppealModalOpen(true);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="申诉"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">暂无成绩数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">共 {grades.length} 条</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>上一页</Button>
            <span className="text-sm text-gray-600">{currentPage} / {pageCount}</span>
            <Button variant="secondary" size="sm" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>下一页</Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="成绩详情" size="lg">
        {selectedGrade && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">学生姓名</label>
                <p className="text-gray-800">{selectedGrade.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">班级</label>
                <p className="text-gray-800">{selectedGrade.className}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">课程</label>
                <p className="text-gray-800">{selectedGrade.courseName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">任课老师</label>
                <p className="text-gray-800">{selectedGrade.teacherName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">成绩</label>
                <p className="text-gray-800">{selectedGrade.score}/{selectedGrade.fullScore}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">等级</label>
                <p className="text-gray-800">{selectedGrade.gradeLevel}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">状态</label>
                <p>{getStatusBadge(selectedGrade.status)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">登记时间</label>
                <p className="text-gray-800">{selectedGrade.createdAt}</p>
              </div>
            </div>
            {selectedGrade.reviewComment && (
              <div>
                <label className="block text-sm font-medium text-gray-500">复核意见</label>
                <p className="text-gray-800">{selectedGrade.reviewComment}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={isAppealModalOpen} onClose={() => setIsAppealModalOpen(false)} title="成绩申诉" size="lg">
        {selectedGrade && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">课程</label>
                <p className="text-gray-800">{selectedGrade.courseName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">原成绩</label>
                <p className="text-gray-800">{selectedGrade.score}/{selectedGrade.fullScore}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">申请分数</label>
              <input
                type="number"
                min="0"
                max={selectedGrade.fullScore}
                value={appealData.requestedScore}
                onChange={(e) => setAppealData({ ...appealData, requestedScore: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={`0-${selectedGrade.fullScore}，且不能与原成绩相同`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">申诉理由</label>
              <textarea
                value={appealData.reason}
                onChange={(e) => setAppealData({ ...appealData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={4}
                placeholder="请详细说明申诉理由..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">授权码</label>
              <input
                type="text"
                value={appealData.authCode}
                onChange={(e) => setAppealData({ ...appealData, authCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="请输入任课老师或教务提供的授权码"
              />
            </div>
            {appealError && <p className="text-sm text-red-600">{appealError}</p>}
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={() => setIsAppealModalOpen(false)}>取消</Button>
              <Button onClick={handleAppealSubmit}>提交申诉</Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default GradeList;
