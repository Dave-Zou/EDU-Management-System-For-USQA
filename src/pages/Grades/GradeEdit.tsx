import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore, useToastStore } from '@/store/useStore';
import Button from '@/components/Button/Button';

const GradeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { getGrades, editGrade } = useGradeStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [score, setScore] = useState('');
  const [fullScore, setFullScore] = useState('');
  const grade = getGrades({}).find((g) => g.id === id);

  useEffect(() => {
    if (grade) {
      setScore(String(grade.score));
      setFullScore(String(grade.fullScore));
    }
  }, [grade]);

  const canEdit = user?.role === 'admin';

  if (!canEdit) {
    return (
      <Layout currentPage="/grades">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">您没有权限编辑成绩</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/grades')}>
              返回成绩列表
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!grade) {
    return (
      <Layout currentPage="/grades">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">未找到该成绩记录</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/grades')}>
              返回成绩列表
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    if (!score || !fullScore) {
      showToast('请填写成绩和满分', 'error');
      return;
    }
    if (Number(score) < 0 || Number(fullScore) <= 0) {
      showToast('成绩或满分不合法', 'error');
      return;
    }
    if (Number(score) > Number(fullScore)) {
      showToast('成绩不能超过满分', 'error');
      return;
    }

    editGrade(id!, {
      score: Number(score),
      fullScore: Number(fullScore),
      status: 'pending',
    });

    showToast('成绩已修改，需重新复核', 'success');
    navigate('/grades');
  };

  return (
    <Layout currentPage="/grades">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate('/grades')}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">编辑成绩</h2>
            <p className="text-gray-500 mt-1">
              {grade.studentName} · {grade.courseName}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">成绩</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">满分</label>
              <input
                type="number"
                value={fullScore}
                onChange={(e) => setFullScore(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <Button variant="secondary" onClick={() => navigate('/grades')}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              保存修改
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GradeEdit;
