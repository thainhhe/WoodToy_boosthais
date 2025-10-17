const teamMembers = [
  {
    name: "Nguyễn Văn An",
    role: "Nhà sáng lập & Thiết kế",
    image: "https://placehold.co/400x400/FFF8F2/4F4F4F?text=An",
  },
  {
    name: "Trần Thị Bình",
    role: "Chuyên gia phát triển trẻ em",
    image: "https://placehold.co/400x400/FFF8F2/4F4F4F?text=Bình",
  },
  {
    name: "Lê Minh Cường",
    role: "Nghệ nhân chế tác",
    image: "https://placehold.co/400x400/FFF8F2/4F4F4F?text=Cường",
  },
  {
    name: "Phạm Thu Duyên",
    role: "Phụ trách cộng đồng",
    image: "https://placehold.co/400x400/FFF8F2/4F4F4F?text=Duyên",
  },
];

export default function Team() {
  return (
    <section id="team" className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-brand-primary mb-12">
          Đội ngũ WoodToys
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name}>
              <img
                src={member.image}
                alt={member.name}
                className="w-48 h-48 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="text-xl font-bold text-brand-primary">
                {member.name}
              </h3>
              <p className="text-brand-secondary">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
