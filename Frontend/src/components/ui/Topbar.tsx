type Props = {
  title: string;
};

function Topbar({ title }: Props) {

  const role = localStorage.getItem("role");

  return (
    <div className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shadow-sm">

      <h1 className="text-xl font-bold text-gray-800">
        {title}
      </h1>

      <div className="flex items-center gap-4">

        <span className="text-sm text-gray-600">
          Welcome, {role} 👋
        </span>

        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center justify-center font-bold">
          {role?.charAt(0)}
        </div>

      </div>

    </div>
  );
}

export default Topbar;