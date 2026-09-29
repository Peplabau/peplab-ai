import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlaskConical, MapPin, Truck, Award, Shield, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: MapPin,
    title: 'SYDNEY BASED SUPPLIER',
    description:
      'PEPLAB operates from Sydney as an independent supplier. Local Australian stock means you deal with an Australian team — and orders do not travel halfway around the world before reaching a lab.',
  },
  {
    icon: FlaskConical,
    title: 'EVERY BATCH LAB-TESTED',
    description:
      'Each production batch goes through analytical testing before release. Batches that do not meet the purity standard are not sent out, so researchers get more consistency order to order.',
  },
  {
    icon: Truck,
    title: 'DOMESTIC DISPATCH',
    description:
      'Stock is held and dispatched within Australia, so orders skip the international customs queue. Fewer timing surprises when a project has a schedule.',
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
        },
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
          },
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="quality" className="relative z-20 py-20 lg:py-28">
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-12">
        <div ref={headerRef} className="mb-12 text-center">
          <span className="eyebrow mb-4 block">WHY PEPLAB</span>
          <h2 className="mb-4 text-3xl font-bold text-[#F4F6FA] sm:text-4xl md:text-5xl">
            Australia&apos;s Choice for <span className="gradient-text">Elite Peptides</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#A9B3C7] sm:text-lg">
            Test everything, publish the results, and keep shipping straightforward — from browsing
            to delivery.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="quality-card rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[#111827] p-6 transition-all duration-300 hover:border-[rgba(46,209,180,0.3)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(46,209,180,0.1)]">
                <feature.icon className="h-6 w-6 text-[#2ED1B4]" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-[#F4F6FA]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#A9B3C7]">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 rounded-full border border-[rgba(46,209,180,0.2)] bg-[rgba(46,209,180,0.1)] px-4 py-2">
            <Award className="h-4 w-4 text-[#2ED1B4]" />
            <span className="text-xs text-[#F4F6FA]">≥99% Purity</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.1)] px-4 py-2">
            <FlaskConical className="h-4 w-4 text-[#8B5CF6]" />
            <span className="text-xs text-[#F4F6FA]">HPLC Verified</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.1)] px-4 py-2">
            <Shield className="h-4 w-4 text-[#3B82F6]" />
            <span className="text-xs text-[#F4F6FA]">Published COAs</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[rgba(236,72,153,0.2)] bg-[rgba(236,72,153,0.1)] px-4 py-2">
            <MessageCircle className="h-4 w-4 text-[#EC4899]" />
            <span className="text-xs text-[#F4F6FA]">Sydney Dispatch</span>
          </div>
        </div>
      </div>
    </section>
  );
}
