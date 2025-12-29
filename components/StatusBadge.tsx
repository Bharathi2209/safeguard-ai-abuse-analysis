
import React from 'react';
import { CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: 'ALLOW' | 'FLAG' | 'BLOCK';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    ALLOW: { 
      style: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
      icon: <CheckCircle className="w-4 h-4" />, 
      label: 'Safe Content' 
    },
    FLAG: { 
      style: 'bg-amber-50 text-amber-700 border-amber-100', 
      icon: <AlertCircle className="w-4 h-4" />, 
      label: 'Review Required' 
    },
    BLOCK: { 
      style: 'bg-rose-50 text-rose-700 border-rose-100', 
      icon: <ShieldAlert className="w-4 h-4" />, 
      label: 'Policy Violation' 
    },
  };

  const config = configs[status] || configs.ALLOW;

  return (
    <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-extrabold border shadow-sm ${config.style}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
