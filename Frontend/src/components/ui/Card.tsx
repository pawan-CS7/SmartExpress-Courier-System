type Props = {
  title: string;
  value: number;
  icon: string;
  color: string;
};

function Card({ title, value, icon, color }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center hover:shadow-md transition">
      <div>
        <h2 className={`text-xl font-bold ${color}`}>
          {value}
        </h2>
        <p className="text-xs text-gray-500 uppercase">
          {title}
        </p>
      </div>

      <div className="text-2xl">
        {icon}
      </div>
    </div>
  );
}

export default Card;