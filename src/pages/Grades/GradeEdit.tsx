import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { useAuthStore, useGradeStore } from '@/store/useStore';
import Button from '@/components/Button/Button';
import Feedback from '@/components/Feedback/Feedback';

const GradeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { getGrades, editGrade } = useGradeStore();
  const navigate = useNavigate();
  const grade = getGrades().find((item) => item.id === id);
  const [score, setScore] = useState(grade ? String(grade.score) : '');
  const [fullScore, setFullScore] = useState(grade ? String(grade.fullScore) : '');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const canEdit =
    !!grade &&
    (user?.role === 'admin' ||
      (user?.role === 'teacher' && grade.teacherId === user.id && grade.status === 'rejected'));

  if (!grade || !canEdit) {
    return (
      <Layout currentPage="/grades">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">{grade ? '您没有权限编辑这条成绩' : '成绩不存在'}</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/grades')}>返回成绩列表</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    const result = editGrade(grade.id, { score: Number(score), fullScore: Number(fullScore) });
    if (!result.ok) {
      setFeedback({ type: 'err', text: result.message });
      return;
    }
    navigate('/grades');
  };

  return (
    <Layout currentPage="/grades">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/grades')}
          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">编辑成绩</h2>
          <p className="text-gray-500 mt-1">修改后会回到待复核</p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Feedback feedback={feedback} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
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
              <p className="text-gray-500">当前状态</p>
              <p className="font-medium text-gray-800">
                {grade.status === 'rejected' ? '已驳回' : grade.status === 'reviewed' ? '已复核' : '待复核'}
              </p>
            </div>
          </div>
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
            <Button variant="secondary" onClick={() => navigate('/grades')}>取消</Button>
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
