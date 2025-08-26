import { categories } from "@/utils/constants";
import { SectionEyebrow } from "@/utils/helpers";
import { section } from "framer-motion/m";
import { ArrowRight, Tag } from "lucide-react";
  

const Category = () => {
    return (
        <section id="explore" className="border-b border-slate-200/60 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
                <SectionEyebrow>Explore</SectionEyebrow>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Explore a World of Possibilities with Our
              <br className="hidden md:block" /> Classified Ads Marketplace
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              From gadgets to furniture, find everything you need in one place.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <article
                key={i}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative">
                  <img src={c.img} alt={c.title} className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow">
                    <Tag className="h-3 w-3" /> Featured
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-1 text-xs text-slate-600">{c.desc}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>2k+ listings</span>
                    <a href="#" className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                      View <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    )}

    export default Category;
