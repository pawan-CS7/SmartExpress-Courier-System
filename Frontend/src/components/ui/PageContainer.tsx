import React from "react";

type Props = {
  children: React.ReactNode;
};

function PageContainer({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {children}
    </div>
  );
}

export default PageContainer;