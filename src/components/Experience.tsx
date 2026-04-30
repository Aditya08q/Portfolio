const ITEMS = [
  {
    period: "2024 — Now",
    title: "Machine Learning Projects",
    org: "Independent / Research",
    description: "Worked on NLP, CV, and Transformer-based systems — from data pipelines to deployable models.",
    tags: ["NLP", "CV", "Transformers"],
  },
  {
    period: "2023",
    title: "Full Stack Development",
    org: "Personal & Open Source",
    description: "Shipped React, Node.js and Flutter apps — bridging ML models with intuitive interfaces.",
    tags: ["React", "Node.js", "Flutter"],
  },
];

const Experience = () => {
  return (
    <section id="experience" className="relative py-24 sm:py-32">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-12">
          <p className="section-heading">{"// 03_experience"}</p>
          <h2 className="font-pixel text-xl sm:text-3xl text-foreground">Journey</h2>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-transparent sm:-translate-x-1/2" />

          <div className="space-y-12">
            {ITEMS.map((item, i) => {
              const left = i % 2 === 0;
              return (
                <div
                  key={item.title}
                  className={`relative grid sm:grid-cols-2 gap-6 sm:gap-12 items-start animate-fade-up`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Node */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-4 w-4 h-4 bg-primary border-2 border-background rounded-sm shadow-[0_0_0_4px_hsl(var(--primary)/0.2)]" />

                  <div className={`pl-12 sm:pl-0 ${left ? "sm:text-right sm:pr-10" : "sm:col-start-2 sm:pl-10"}`}>
                    <div className="pixel-card p-5 inline-block text-left">
                      <span className="font-mono text-xs text-accent">{item.period}</span>
                      <h3 className="font-pixel text-sm text-foreground mt-2 mb-1">{item.title}</h3>
                      <p className="font-mono text-xs text-secondary mb-3">{item.org}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((t) => (
                          <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
