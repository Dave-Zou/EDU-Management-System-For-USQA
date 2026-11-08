import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, CheckSquare, Square } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import { Grade } from '@/types';

const GradeReview = () => {
  const { user } = useAuthStore();
  const { getGrades, reviewGrade, batchReviewGrades } = useGradeStore();
  const navigate = useNavigate();

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<'reviewed' | 'rejected'>('reviewed');
  const [batchComment, setBatchComment] = useState('');

  const getFilteredGrades = () => {
    const params: Record<string, string> = { status: 'pending' };
    if (user?.role === 'homeroom_teacher' && user.classId) {
      params.classId = user.classId;
    }
    return getGrades(params);
  };

  const pendingGrades = getFilteredGrades();

  const canReview = user?.role === 'homeroom_teacher' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingGrades.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingGrades.map((g) => g.id));
    }
  };

  const handleBatchReview = (status: 'reviewed' | 'rejected') => {
    if (selectedIds.length === 0) return;
    
    batchReviewGrades(status, selectedIds, batchComment || undefined);
    alert(`已批量${status === 'reviewed' ? '通过' : '驳回'} ${selectedIds.length}条成绩`);
    setIsBatchModalOpen(false);
    setSelectedIds([]);
    setBatchComment('');
  };

  if (!canReview) {
    return (
      <Layout currentPage="/grades/review">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">您没有权限复核成绩</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleReview = (status: 'reviewed' | 'rejected') => {
    if (!selectedGrade) return;
    
    reviewGrade(selectedGrade.id, status, comment || undefined);
    alert(status === 'reviewed' ? '成绩已通过复核' : '成绩已驳回');
    setIsModalOpen(false);
    setSelectedGrade(null);
    setComment('');
  };

  return (
    <Layout currentPage="/grades/review">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/grades')}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">成绩复核</h2>
            <p className="text-gray-500 mt-1">审核待复核的成绩</p>
          </div>
        </div>
        {isAdmin && pendingGrades.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">已选择 {selectedIds.length} 条</span>
            <Button 
              variant="success" 
              size="sm" 
              onClick={() => { setBatchAction('reviewed'); setIsBatchModalOpen(true); }}
              disabled={selectedIds.length === 0}
            >
              <Check className="w-4 h-4 mr-1" />
              一键通过
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => { setBatchAction('rejected'); setIsBatchModalOpen(true); }}
              disabled={selectedIds.length === 0}
            >
              <X className="w-4 h-4 mr-1" />
              一键驳回
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      {selectedIds.length === pendingGrades.length && pendingGrades.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">学生</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">班级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任课老师</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成绩</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">登记时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingGrades.length > 0 ? (
                pendingGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSelect(grade.id)}
                          className="flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          {selectedIds.includes(grade.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.className}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.teacherName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.score}/{grade.fullScore}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.gradeLevel}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{grade.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedGrade(grade);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          复核
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-6 py-12 text-center text-gray-400">
                    暂无待复核成绩
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="成绩复核" size="lg">
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">复核意见（选填）</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请输入复核意见"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="danger" onClick={() => handleReview('rejected')}>
                <X className="w-4 h-4 mr-2" />
                驳回
              </Button>
              <Button variant="success" onClick={() => handleReview('reviewed')}>
                <Check className="w-4 h-4 mr-2" />
                通过
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title={batchAction === 'reviewed' ? '批量通过' : '批量驳回'} size="lg">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-blue-800">
              即将{batchAction === 'reviewed' ? '通过' : '驳回'} <span className="font-bold">{selectedIds.length}</span> 条成绩
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">复核意见（选填）</label>
            <textarea
              value={batchComment}
              onChange={(e) => setBatchComment(e.target.value)}
              placeholder="请输入批量复核意见"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsBatchModalOpen(false)}>
              取消
            </Button>
            <Button variant={batchAction === 'reviewed' ? 'success' : 'danger'} onClick={() => handleBatchReview(batchAction)}>
              {batchAction === 'reviewed' ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
              确认{batchAction === 'reviewed' ? '通过' : '驳回'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default GradeReview;