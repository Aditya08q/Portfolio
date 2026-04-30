const SKILLS = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "Transformers",
  "Flutter",
  "React",
  "Node.js",
];

const About = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="max-w-content mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <p className="section-heading">{"// 01_about"}</p>
          <h2 className="font-pixel text-xl sm:text-3xl mb-6 text-foreground">About Me</h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
            I specialize in <span className="text-primary font-semibold">Machine Learning</span>,{" "}
            <span className="text-secondary font-semibold">Deep Learning</span>, and Full Stack Development.
            I build scalable AI systems and intuitive interfaces.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From training transformers from scratch to shipping real-world apps — I love bridging research and product.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { num: "10+", label: "Projects" },
              { num: "5+", label: "ML Models" },
              { num: "∞", label: "Curiosity" },
            ].map((s) => (
              <div key={s.label} className="pixel-card p-4 text-center">
                <div className="font-pixel text-base sm:text-lg text-primary">{s.num}</div>
                <div className="font-mono text-[11px] text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="section-heading">{"// stack"}</p>
          <h3 className="font-pixel text-base sm:text-xl mb-6 text-foreground">Skills & Tools</h3>
          <div className="flex flex-wrap gap-3">
            {SKILLS.map((skill) => (
              <span key={skill} className="pixel-tag text-foreground">
                <span className="w-1.5 h-1.5 bg-primary" />
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-8 pixel-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-muted-foreground">~/focus.json</span>
              <span className="font-mono text-xs text-primary">● live</span>
            </div>
            <pre className="font-mono text-xs sm:text-sm text-foreground overflow-x-auto">
{`{
  "currently": "training_transformers",
  "exploring": ["RAG", "Agents", "Diffusion"],
  "stack": ["PyTorch", "FastAPI", "React"],
  "open_to": "ML internships & roles"
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
