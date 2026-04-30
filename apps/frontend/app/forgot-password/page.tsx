import { AuthForm } from '@/components/auth/AuthForm';

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <AuthForm mode="forgot-password" />
    </div>
  );
}
