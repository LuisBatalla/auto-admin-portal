
import { RegisterForm } from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
