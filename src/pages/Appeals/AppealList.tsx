import { useState } from 'react';
import { Search, Eye, Check, X } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useAppealStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import { Appeal, AppealStatus } from '@/types';

const AppealList = () => {
  const { user } = useAuthStore();
  const { getAppeals, reviewAppeal } = useAppealStore();
  
  const [filters, setFilters] = useState({
    classId: '',
    courseId: '',
    status: '',
  });
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  const getFilteredAppeals = () => {
    const params: Record<string, string> = {};
    
    if (user?.role === 'student') {
      params.studentId = user.id;
    } else if (user?.role === 'homeroom_teacher' && user.classId) {
      params.classId = user.classId;
    } else if (user?.role === 'teacher') {
      params.teacherId = user.id;
    }
    
    if (filters.classId) params.classId = filters.classId;
    if (filters.courseId) params.courseId = filters.courseId;
    if (filters.status) params.status = filters.status as AppealStatus;
    
    return getAppeals(params);
  };

  const appeals = getFilteredAppeals();

  const getStatusBadge = (status: AppealStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">待审核</span>;
      case 'reviewing':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">审核中</span>;
      case 'approved':
        return <span className="px-2 py-1 text-green-100 text-green-700 rounded-full">已批准</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-red-100 text-red-700 rounded-full">已驳回</span>;
      default:
        return null;
    }
  };

  const canReview = user?.role === 'homeroom_teacher' || user?.role === 'admin' || user?.role === 'teacher';
  
  const handleReview = (status: AppealStatus) => {
    if (!selectedAppeal) return;
    
    let reviewerRole = '';
    if (user?.role === 'homeroom_teacher') {
      reviewerRole = 'homeroom_teacher';
    } else if (user?.role === 'teacher') {
      reviewerRole = 'teacher';
    } else if (user?.role === 'admin') {
      reviewerRole = 'admin';
    }
    
    reviewAppeal(selectedAppeal.id, status, reviewComment || undefined, reviewerRole);
    setIsModalOpen(false);
    setSelectedAppeal(null);
    setReviewComment('');
    alert(status === 'approved' ? '申诉已批准' : '申诉已驳回');
  };

  return (
    <Layout currentPage="/appeals">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">申诉管理</h2>
          <p className="text-gray-500 mt-1">查看和处理成绩申诉</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.role !== 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="reviewing">审核中</option>
                <option value="approved">已批准</option>
                <option value="rejected">已驳回</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => setFilters({ classId: '', courseId: '', status: '' })}>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">原成绩</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">申请分数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提交时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appeals.length > 0 ? (
                appeals.map((appeal) => (
                  <tr key={appeal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.className}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.teacherName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.originalScore}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.requestedScore}</td>
                    <td className="px-6 py-4">{getStatusBadge(appeal.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAppeal(appeal);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    暂无申诉数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="申诉详情" size="lg">
        {selectedAppeal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">学生姓名</label>
                <p className="text-gray-800">{selectedAppeal.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">班级</label>
                <p className="text-gray-800">{selectedAppeal.className}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">课程</label>
                <p className="text-gray-800">{selectedAppeal.courseName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">任课老师</label>
                <p className="text-gray-800">{selectedAppeal.teacherName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">原成绩</label>
                <p className="text-gray-800">{selectedAppeal.originalScore}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">申请分数</label>
                <p className="text-gray-800">{selectedAppeal.requestedScore}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">状态</label>
                <p className="text-gray-800">{getStatusBadge(selectedAppeal.status)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">提交时间</label>
                <p className="text-gray-800">{selectedAppeal.createdAt}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">申诉理由</label>
              <p className="text-gray-800 whitespace-pre-wrap">{selectedAppeal.reason}</p>
            </div>

            {selectedAppeal.homeroomComment && (
              <div>
                <label className="block text-sm font-medium text-gray-500">班主任意见</label>
                <p className="text-gray-800">{selectedAppeal.homeroomComment}</p>
              </div>
            )}

            {selectedAppeal.teacherComment && (
              <div>
                <label className="block text-sm font-medium text-gray-500">任课老师意见</label>
                <p className="text-gray-800">{selectedAppeal.teacherComment}</p>
              </div>
            )}

            {selectedAppeal.adminComment && (
              <div>
                <label className="block text-sm font-medium text-gray-500">教务意见</label>
                <p className="text-gray-800">{selectedAppeal.adminComment}</p>
              </div>
            )}

            {canReview && selectedAppeal.status !== 'approved' && selectedAppeal.status !== 'rejected' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审核意见</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                    placeholder="请填写审核意见..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="danger" onClick={() => handleReview('rejected')}>
                    <X className="w-4 h-4 mr-2" />
                    驳回
                  </Button>
                  <Button onClick={() => handleReview('approved')}>
                    <Check className="w-4 h-4 mr-2" />
                    批准
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default AppealList;