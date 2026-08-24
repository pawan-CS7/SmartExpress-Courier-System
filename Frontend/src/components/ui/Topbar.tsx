import { getCurrentUser, getUserInitials } from "../../utils/auth";

type Props = {
  title: string;
};

function Topbar({ title }: Props) {
  const user = getCurrentUser();
  const displayName = user.name || user.role || "User";
  const initials = getUserInitials(displayName);

  return (
    <div className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shadow-sm">
      <h1 className="text-xl font-bold text-gray-800">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, <strong className="text-gray-900">{displayName}</strong> 👋
        </span>

        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {initials}
        </div>
      </div>
    </div>
  );
}

export default Topbar;