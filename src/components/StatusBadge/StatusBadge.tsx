import { AppealStatus, GradeStatus } from '@/types';
import { APPEAL_STATUS_LABELS, GRADE_STATUS_LABELS, appealStatusClass, gradeStatusClass } from '@/utils/labels';

export const GradeStatusBadge = ({ status }: { status: GradeStatus | string }) => {
  const key = status as GradeStatus;
  const label = GRADE_STATUS_LABELS[key] ?? status;
  const cls = gradeStatusClass[key] ?? 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-1 text-xs rounded-full ${cls}`}>{label}</span>;
};

export const AppealStatusBadge = ({ status }: { status: AppealStatus }) => (
  <span className={`px-2 py-1 text-xs rounded-full ${appealStatusClass[status]}`}>
    {APPEAL_STATUS_LABELS[status]}
  </span>
);
