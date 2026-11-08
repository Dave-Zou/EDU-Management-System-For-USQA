import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAppStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import { Grade } from '@/types';

const GradeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user, getGrades, editGrade, showToast } = useAppStore();
  const navigate = useNavigate();

  const [grade, setGrade] = useState<Grade | undefined>();
  const [score, setScore] = useState('');
  const [fullScore, setFullScore] = useState('');

  useEffect(() => {
    const found = getGrades({}).find((item) => item.id === id);
    if (found) {
      setGrade(found);
      setScore(String(found.score));
      setFullScore(String(found.fullScore));
    }
  }, [id, getGrades]);

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

  const handleSubmit = () => {
    if (!score || !fullScore) {
      showToast('请填写成绩和满分', 'warning');
      return;
    }

    if (Number(score) > Number(fullScore)) {
      showToast('成绩不能超过满分', 'warning');
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
            onClick={() => navigate('/grades')}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">编辑成绩</h2>
            <p className="text-gray-500 mt-1">修改已登记的成绩</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {grade && (
            <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">学生</p>
                <p className="font-medium text-gray-800">{grade.studentName}</p>
              </div>
              <div>
                <p className="text-gray-500">课程</p>
                <p className="font-medium text-gray-800">{grade.courseName}</p>
              </div>
              <div>
                <p className="text-gray-500">班级</p>
                <p className="font-medium text-gray-800">{grade.className}</p>
              </div>
              <div>
                <p className="text-gray-500">任课老师</p>
                <p className="font-medium text-gray-800">{grade.teacherName}</p>
              </div>
            </div>
          )}
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
