import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, FlaskConical, Shield, Award, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: FlaskConical,
    title: 'PURITY & QUALITY',
    description: 'Made pure for research. Every batch is lyophilized for stability and tested for identity and purity—so your research starts with a clean baseline.',
  },
  {
    icon: Check,
    title: 'STANDARDS & TESTING',
    description: 'HPLC-verified identity. Accurate net peptide content. Batch records you can reference. Clean synthesis. Stable storage. Reliable assays—so your data holds up.',
  },
  {
    icon: Shield,
    title: 'RELIABILITY',
    description: 'Lab-grade materials. Research-focused. Transparent specs. Consistent quality. Support that understands your research workflow.',
  },
];

export default function Quality() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            end: 'top 60%',
            scrub: true,
          },
        }
      );

      const cards = cardsRef.current?.querySelectorAll('.quality-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              end: 'top 50%',
              scrub: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="quality"
      className="relative z-20 py-20 lg:py-28"
    >
      <div className="relative z-10 px-6 lg:px-12 max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <span className="eyebrow mb-4 block">WHY PEPLAB</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
            HPLC-Verified <span className="gradient-text">Peptides</span>
          </h2>
          <p className="text-base sm:text-lg text-[#A9B3C7] max-w-2xl mx-auto">
            High-performance peptides with ≥99% purity. Every batch tested, every result verified.
          </p>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="quality-card p-6 rounded-2xl bg-[#111827] border border-[rgba(244,246,250,0.08)] hover:border-[rgba(46,209,180,0.3)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[rgba(46,209,180,0.1)] flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#2ED1B4]" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F6FA] mb-3">{feature.title}</h3>
              <p className="text-sm text-[#A9B3C7] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(46,209,180,0.1)] border border-[rgba(46,209,180,0.2)]">
            <Award className="w-4 h-4 text-[#2ED1B4]" />
            <span className="text-xs text-[#F4F6FA]">≥99% Purity</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)]">
            <FlaskConical className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-xs text-[#F4F6FA]">HPLC Verified</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)]">
            <Shield className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-xs text-[#F4F6FA]">Lab-Grade</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.2)]">
            <MessageCircle className="w-4 h-4 text-[#EC4899]" />
            <span className="text-xs text-[#F4F6FA]">Expert Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
