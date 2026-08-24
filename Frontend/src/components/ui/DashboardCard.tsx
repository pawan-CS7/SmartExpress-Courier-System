type Props = {
  title: string;
  value: string | number;
  icon: string;
};

function DashboardCard({ title, value, icon }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group cursor-default">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-red-500 transition-colors">
            {title}
          </p>

          <h3 className="text-3xl font-extrabold text-gray-800">
            {value}
          </h3>
        </div>

        <div className="text-4xl bg-gray-50 w-14 h-14 flex items-center justify-center rounded-xl group-hover:scale-110 group-hover:bg-red-50 transition-all duration-300">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default DashboardCard;