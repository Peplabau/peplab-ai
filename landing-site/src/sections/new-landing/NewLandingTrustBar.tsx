import { Beaker, FlaskConical, Truck, Layers } from 'lucide-react';

const items = [
  { icon: FlaskConical, label: '≥99% Purity', sub: 'Research grade' },
  { icon: Beaker, label: 'HPLC Tested', sub: 'Batch verified' },
  { icon: Layers, label: '60+ Compounds', sub: 'Live catalog' },
  { icon: Truck, label: 'AU Express', sub: 'Domestic shipping' },
];

export default function NewLandingTrustBar() {
  return (
    <section
      className="relative z-20 border-y border-[rgba(244,246,250,0.08)]"
      style={{ background: 'rgba(17,24,39,0.85)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(46,209,180,0.1)] border border-[rgba(46,209,180,0.2)] flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-[#2ED1B4]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F4F6FA]">{item.label}</p>
                <p className="text-[11px] text-[#A9B3C7]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
