import React from "react";

type Props = {
  title?: string;
  value?: number;
  icon?: string;
  color?: string;
  children?: React.ReactNode;
  className?: string;
};

function Card({ title, value, icon, color, children, className = "" }: Props) {
  if (children) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
        {title && <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>}
        {children}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 flex justify-between items-center hover:shadow-md transition ${className}`}>
      <div>
        <h2 className={`text-xl font-bold ${color || "text-slate-800"}`}>
          {value ?? 0}
        </h2>
        {title && (
          <p className="text-xs text-gray-500 uppercase">
            {title}
          </p>
        )}
      </div>

      {icon && (
        <div className="text-2xl">
          {icon}
        </div>
      )}
    </div>
  );
}

export default Card;