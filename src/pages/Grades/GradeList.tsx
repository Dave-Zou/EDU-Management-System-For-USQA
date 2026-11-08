import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Eye, FileText, ArrowUpDown } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAppStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import Pagination from '@/components/Pagination/Pagination';
import { Grade } from '@/types';
import { gradeStatusLabels } from '@/utils/labels';
import { validAuthCodes as authCodes } from '@/data/mockData';

const PAGE_SIZE = 8;

const GradeList = () => {
  const { user, getGrades, courses, classes, addAppeal, showToast } = useAppStore();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    classId: '',
    courseId: '',
    keyword: '',
    status: '',
  });
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [appealData, setAppealData] = useState({
    requestedScore: '',
    reason: '',
    authCode: '',
  });
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  const grades = useMemo(() => {
    const params: Parameters<typeof getGrades>[0] = {};
    if (user?.role === 'student') params.studentId = user.id;
    else if (user?.role === 'teacher') params.teacherId = user.id;
    else if (user?.role === 'homeroom_teacher' && user.classId) params.classId = user.classId;

    if (filters.classId) params.classId = filters.classId;
    if (filters.courseId) params.courseId = filters.courseId;
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.status) params.status = filters.status as Grade['status'];

    const list = [...getGrades(params)];
    if (sortDir === 'asc') list.sort((a, b) => a.score - b.score);
    if (sortDir === 'desc') list.sort((a, b) => b.score - a.score);
    return list;
  }, [user, filters, getGrades, sortDir]);

  const pagedGrades = grades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusBadge = (status: Grade['status']) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${map[status]}`}>{gradeStatusLabels[status]}</span>;
  };

  const canEdit = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const canRegister = user?.role === 'teacher' || user?.role === 'admin';

  const handleAppealSubmit = () => {
    if (!selectedGrade || !appealData.requestedScore || !appealData.reason || !appealData.authCode) {
      showToast('请填写完整申诉信息', 'warning');
      return;
    }

    const requested = Number(appealData.requestedScore);
    if (Number.isNaN(requested) || requested < 0 || requested > selectedGrade.fullScore) {
      showToast('申请分数必须在 0 到满分之间', 'warning');
      return;
    }

    const success = addAppeal({
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
      requestedScore: requested,
      reason: appealData.reason,
      authCode: appealData.authCode.toUpperCase(),
      status: 'pending',
    });

    if (success) {
      showToast('申诉提交成功，等待审核', 'success');
      setIsAppealModalOpen(false);
      setAppealData({ requestedScore: '', reason: '', authCode: '' });
      setSelectedGrade(null);
    } else {
      showToast('授权码无效，或该成绩已有进行中的申诉', 'error');
    }
  };

  return (
    <Layout currentPage="/grades">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">成绩查询</h2>
          <p className="text-gray-500 mt-1">查看成绩列表</p>
        </div>
        {canRegister && <Button onClick={() => navigate('/grades/register')}>登记成绩</Button>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {user?.role !== 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
              <select
                value={filters.classId}
                onChange={(e) => {
                  setFilters({ ...filters, classId: e.target.value });
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">课程</label>
            <select
              value={filters.courseId}
              onChange={(e) => {
                setFilters({ ...filters, courseId: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部课程</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部状态</option>
              <option value="pending">待复核</option>
              <option value="reviewed">已复核</option>
              <option value="rejected">已驳回</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学生 / 学号</label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => {
                setFilters({ ...filters, keyword: e.target.value });
                setPage(1);
              }}
              placeholder="姓名或学号"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button
            variant="secondary"
            onClick={() => {
              setFilters({ classId: '', courseId: '', keyword: '', status: '' });
              setPage(1);
            }}
          >
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学生</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任课老师</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    className="inline-flex items-center gap-1"
                    onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
                  >
                    成绩
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedGrades.length > 0 ? (
                pagedGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.className}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.teacherName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {grade.score}/{grade.fullScore}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.gradeLevel}</td>
                    <td className="px-6 py-4">{getStatusBadge(grade.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedGrade(grade);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => navigate(`/grades/edit/${grade.id}`)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {isStudent && grade.status === 'reviewed' && (
                          <button
                            onClick={() => {
                              setSelectedGrade(grade);
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
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    暂无成绩数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={grades.length} onChange={setPage} />
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
                <p className="text-gray-800">
                  {selectedGrade.score}/{selectedGrade.fullScore}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">等级</label>
                <p className="text-gray-800">{selectedGrade.gradeLevel}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">状态</label>
                <p className="text-gray-800">{getStatusBadge(selectedGrade.status)}</p>
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">学生姓名</label>
                <p className="text-gray-800">{selectedGrade.studentName}</p>
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
                <label className="block text-sm font-medium text-gray-500">原成绩</label>
                <p className="text-gray-800">
                  {selectedGrade.score}/{selectedGrade.fullScore}
                </p>
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
                placeholder={`请输入申请分数（0-${selectedGrade.fullScore}）`}
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
              <p className="text-xs text-gray-500 mt-1">
                演示授权码：{authCodes.join(' / ')}
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={() => setIsAppealModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAppealSubmit}>提交申诉</Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default GradeList;
