import SearchForm from "@/components/SearchForm";

export default function HomePage() {
  const destinations = [
    { code: "MHD", city: "مشهد", desc: "زیارت و سیاحت", emoji: "🕌" },
    { code: "KIH", city: "کیش", desc: "جزیره‌ی آرامش", emoji: "🏝️" },
    { code: "SYZ", city: "شیراز", desc: "شهر شعر و گل", emoji: "🌸" },
    { code: "TBZ", city: "تبریز", desc: "شهر اولین‌ها", emoji: "🏛️" },
    { code: "RAS", city: "رشت", desc: "بام سبز ایران", emoji: "🌿" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary to-primary/90 text-primary-content">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-16 w-[28rem] h-[28rem] rounded-full bg-white/10 pointer-events-none"></div>
        <div className="absolute top-10 left-1/4 w-40 h-40 rounded-full bg-white/5 pointer-events-none"></div>

        <div className="container mx-auto px-4 pt-16 pb-40 sm:pb-44 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              پروازت را پیدا کن،
              <br />
              <span className="text-white/90">سفرت را شروع کن</span>
            </h1>
            <p className="mt-4 text-primary-content/80 text-lg">
              مقایسه قیمت بلیط هواپیماهای داخلی از معتبرترین ایرلاین‌ها، با یک
              کلیک.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="badge badge-outline badge-lg border-white/40 text-white gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                رزرو امن و مطمئن
              </span>
              <span className="badge badge-outline badge-lg border-white/40 text-white gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                بهترین قیمت تضمینی
              </span>
            </div>
          </div>
        </div>

        {/* Search card overlapping the hero */}
        <div className="container mx-auto px-4 relative z-10 -mt-32 pb-16">
          <SearchForm />
        </div>
      </section>

      {/* Popular destinations */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-extrabold mb-5 flex items-center gap-2">
          <span className="badge badge-primary badge-lg badge-outline">
            🔥
          </span>
          مقاصد پرطرفدار
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {destinations.map((d) => (
            <button
              key={d.code}
              className="group card bg-base-100 border border-base-300 hover:border-primary transition-colors text-right p-4 shadow-sm hover:shadow-md"
            >
              <span className="text-3xl mb-2">{d.emoji}</span>
              <span className="font-bold group-hover:text-primary transition-colors">
                {d.city}
              </span>
              <span className="text-xs opacity-60 mt-1">{d.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-extrabold mb-5">چطور کار می‌کند؟</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <span className="text-3xl font-black text-primary">۱</span>
              <h3 className="card-title text-base">جستجو</h3>
              <p className="text-sm opacity-70">
                مبدا، مقصد و تاریخ سفرت را انتخاب کن.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <span className="text-3xl font-black text-primary">۲</span>
              <h3 className="card-title text-base">مقایسه</h3>
              <p className="text-sm opacity-70">
                بین ایرلاین‌ها و زمان‌های مختلف مقایسه کن.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <span className="text-3xl font-black text-primary">۳</span>
              <h3 className="card-title text-base">رزرو</h3>
              <p className="text-sm opacity-70">
                مشخصات مسافران را وارد کن و بلیطت را تحویل بگیر.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
