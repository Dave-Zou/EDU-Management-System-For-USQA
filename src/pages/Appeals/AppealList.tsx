import { useState } from 'react';
import { Eye, Check, X } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useAppealStore } from '@/store/useStore';
import { appealAuthCodes } from '@/data/mockData';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import Feedback from '@/components/Feedback/Feedback';
import { Appeal, AppealStatus } from '@/types';

const AppealList = () => {
  const { user } = useAuthStore();
  const { getAppeals, reviewAppeal } = useAppealStore();
  const [status, setStatus] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [modalError, setModalError] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const params: { studentId?: string; classId?: string; teacherId?: string; status?: AppealStatus } = {};
  if (user?.role === 'student') params.studentId = user.id;
  if (user?.role === 'homeroom_teacher' && user.classId) params.classId = user.classId;
  if (user?.role === 'teacher') params.teacherId = user.id;
  if (status) params.status = status as AppealStatus;
  const appeals = getAppeals(params);

  const getStatusBadge = (value: AppealStatus) => {
    const styles: Record<AppealStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels: Record<AppealStatus, string> = {
      pending: '待班主任初审',
      reviewing: '审核中',
      approved: '已批准',
      rejected: '已驳回',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${styles[value]}`}>{labels[value]}</span>;
  };

  const stageText = (appeal: Appeal) => {
    if (appeal.status === 'pending') return '等待班主任初审';
    if (appeal.status === 'reviewing' && !appeal.teacherComment) return '等待任课老师确认';
    if (appeal.status === 'reviewing') return '等待教务终审';
    return appeal.status === 'approved' ? '已结束' : '已驳回';
  };

  const canAct = (appeal: Appeal) => {
    if (!user || appeal.status === 'approved' || appeal.status === 'rejected') return false;
    if (user.role === 'homeroom_teacher') return appeal.status === 'pending' && appeal.classId === user.classId;
    if (user.role === 'teacher') return appeal.status === 'reviewing' && !appeal.teacherComment && appeal.teacherId === user.id;
    return user.role === 'admin';
  };

  const agreeLabel = user?.role === 'admin' ? '批准并更新成绩' : user?.role === 'teacher' ? '同意调整' : '通过初审';

  const openAppeal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setReviewComment('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleReview = (decision: 'approved' | 'rejected') => {
    if (!selectedAppeal || !user) return;
    const result = reviewAppeal(selectedAppeal.id, decision, reviewComment.trim() || undefined, user.role);
    if (!result.ok) {
      setModalError(result.message);
      return;
    }
    setFeedback({ type: 'ok', text: result.message });
    setIsModalOpen(false);
    setSelectedAppeal(null);
  };

  return (
    <Layout currentPage="/appeals">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">申诉管理</h2>
        <p className="text-gray-500 mt-1">班主任初审，任课老师确认，教务终审后更新成绩</p>
      </div>
      <Feedback feedback={feedback} />

      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-800">
          可发给学生的授权码：{appealAuthCodes.join('、')}
        </div>
      )}

      {user?.role !== 'student' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">状态</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">全部状态</option>
            <option value="pending">待班主任初审</option>
            <option value="reviewing">审核中</option>
            <option value="approved">已批准</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学生</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">原成绩</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">申请分数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">进度</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appeals.length > 0 ? (
                appeals.map((appeal) => (
                  <tr key={appeal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.originalScore}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{appeal.requestedScore}</td>
                    <td className="px-6 py-4">{getStatusBadge(appeal.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openAppeal(appeal)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">暂无申诉数据</td>
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
                <label className="block text-sm font-medium text-gray-500">学生</label>
                <p className="text-gray-800">{selectedAppeal.studentName} · {selectedAppeal.className}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">课程</label>
                <p className="text-gray-800">{selectedAppeal.courseName} · {selectedAppeal.teacherName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">分数</label>
                <p className="text-gray-800">{selectedAppeal.originalScore} → {selectedAppeal.requestedScore}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">当前进度</label>
                <p className="text-gray-800">{stageText(selectedAppeal)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">申诉理由</label>
              <p className="text-gray-800 whitespace-pre-wrap">{selectedAppeal.reason}</p>
            </div>
            {selectedAppeal.homeroomComment && <p className="text-sm text-gray-700">班主任：{selectedAppeal.homeroomComment}</p>}
            {selectedAppeal.teacherComment && <p className="text-sm text-gray-700">任课老师：{selectedAppeal.teacherComment}</p>}
            {selectedAppeal.adminComment && <p className="text-sm text-gray-700">教务：{selectedAppeal.adminComment}</p>}

            {canAct(selectedAppeal) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审核意见{user?.role === 'admin' ? '' : ''}</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                    placeholder="驳回时必填"
                  />
                </div>
                {modalError && <p className="text-sm text-red-600">{modalError}</p>}
                <div className="flex justify-end space-x-4">
                  <Button variant="danger" onClick={() => handleReview('rejected')}>
                    <X className="w-4 h-4 mr-2" />
                    驳回
                  </Button>
                  <Button onClick={() => handleReview('approved')}>
                    <Check className="w-4 h-4 mr-2" />
                    {agreeLabel}
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
