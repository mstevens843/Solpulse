import React from 'react';
import { Lock } from 'lucide-react';

const PrivateProfileNotice = () => (
  <div className="private-profile-lock text-center text-gray-500 dark:text-gray-400 mt-6">
    <Lock className="w-8 h-8 mx-auto mb-2" />
    <p className="text-lg font-semibold">This account is private</p>
    <p className="text-sm">Follow to see their posts and activity.</p>
  </div>
);

export default PrivateProfileNotice;