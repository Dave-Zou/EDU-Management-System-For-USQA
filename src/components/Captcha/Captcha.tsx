import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  code: string;
  onRefresh: () => void;
}

const Captcha = ({ code, onRefresh }: CaptchaProps) => {
  return (
    <button
      type="button"
      onClick={onRefresh}
      title="点击刷新验证码"
      className="relative h-12 w-28 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-[repeating-linear-gradient(45deg,#eef2ff,#eef2ff_8px,#e0e7ff_8px,#e0e7ff_16px)]"
    >
      <span className="absolute inset-0 flex items-center justify-center tracking-[0.35em] font-bold text-lg text-primary-700 select-none italic">
        {code}
      </span>
      <RefreshCw className="absolute right-1 bottom-1 w-3 h-3 text-gray-400" />
    </button>
  );
};

export const createCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default Captcha;
