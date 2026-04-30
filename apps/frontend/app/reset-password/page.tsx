import { AuthForm } from '@/components/auth/AuthForm';

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <AuthForm mode="reset-password" />
    </div>
  );
}
