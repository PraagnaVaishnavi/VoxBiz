import { useState } from 'react';

const ForgotPassword = ({ theme }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);

  const handleSendCode = async () => {
    const response = await fetch('http://localhost:3000/api/auth/send-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (data.success) {
      setStep(2);
    } else {
      alert(data.message);
    }
  };

  const handleVerifyCode = async () => {
    const response = await fetch('http://localhost:3000/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();
    if (data.success) {
      setStep(3);
    } else {
      alert(data.message);
    }
  };

  const handleResetPassword = async () => {
    const response = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await response.json();
    if (data.success) {
      alert('Password reset successfully');
      navigate('/login');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gray-800">
        <h2 className="text-2xl font-semibold text-center">
          {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify Code' : 'Reset Password'}
        </h2>
  
        {step === 1 && (
          <>
            <input
              type="email"
              className="w-full px-4 py-3 mt-4 rounded-lg border bg-gray-700 text-white focus:border-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSendCode} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Send Reset Code
            </button>
          </>
        )}
  
        {step === 2 && (
          <>
            <input
              type="text"
              className="w-full px-4 py-3 mt-4 rounded-lg border bg-gray-700 text-white focus:border-blue-500"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={handleVerifyCode} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Verify Code
            </button>
          </>
        )}
  
        {step === 3 && (
          <>
            <input
              type="password"
              className="w-full px-4 py-3 mt-4 rounded-lg border bg-gray-700 text-white focus:border-blue-500"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={handleResetPassword} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
  
};

export default ForgotPassword;